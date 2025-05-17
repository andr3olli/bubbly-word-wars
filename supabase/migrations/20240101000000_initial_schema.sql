-- Enable the pgcrypto extension for UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- Create games table
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'finished')),
  current_round integer not null default 0,
  max_rounds integer not null default 3,
  created_by uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.games enable row level security;

-- Players table
create table public.players (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid not null,
  name text not null,
  score integer not null default 0,
  color text not null,
  is_host boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(game_id, user_id)
);

alter table public.players enable row level security;

-- Words table
create table public.words (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references public.games(id) on delete cascade not null,
  text text not null,
  category text not null check (category in ('easy', 'medium', 'hard')),
  column_index integer not null,
  row_index integer not null,
  is_claimed boolean not null default false,
  claimed_by uuid references public.players(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(game_id, column_index, row_index)
);

alter table public.words enable row level security;

-- Create indexes for better query performance
create index idx_players_game_id on public.players(game_id);
create index idx_words_game_id on public.words(game_id);
create index idx_words_claimed on public.words(is_claimed, game_id);

-- Create a function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers to update updated_at columns
create trigger handle_games_updated_at
  before update on public.games
  for each row execute procedure public.handle_updated_at();

create trigger handle_players_updated_at
  before update on public.players
  for each row execute procedure public.handle_updated_at();

create trigger handle_words_updated_at
  before update on public.words
  for each row execute procedure public.handle_updated_at();

-- Set up Row Level Security policies
-- Games
create policy "Games are viewable by everyone"
  on public.games for select
  using (true);

create policy "Users can create games"
  on public.games for insert
  with check (auth.uid() = created_by);

-- Players
create policy "Players are viewable by everyone"
  on public.players for select
  using (true);

create policy "Users can join games"
  on public.players for insert
  with check (auth.uid() = user_id);

-- Words
create policy "Words are viewable by everyone"
  on public.words for select
  using (true);

-- Create a function to claim a word and update the player's score atomically
create or replace function public.claim_word_and_update_score(
  word_id uuid,
  player_id uuid,
  points integer
) returns json
language plpgsql
as $$
declare
  word_record record;
  player_record record;
  result json;
begin
  -- Get the word and lock it for update
  select * into word_record from words where id = word_id for update;
  
  -- Check if word is already claimed
  if word_record.is_claimed then
    raise exception 'Word already claimed';
  end if;
  
  -- Update the word as claimed
  update words
  set is_claimed = true, claimed_by = player_id, updated_at = now()
  where id = word_id
  returning * into word_record;
  
  -- Update the player's score
  update players
  set score = score + points, updated_at = now()
  where id = player_id
  returning * into player_record;
  
  -- Return the updated records
  select json_build_object(
    'word', to_jsonb(word_record) - 'updated_at',
    'player', to_jsonb(player_record) - 'updated_at'
  ) into result;
  
  return result;
end;
$$;

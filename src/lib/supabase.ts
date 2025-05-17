import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Realtime types
export type Game = {
  id: string;
  name: string;
  created_at: string;
  status: 'waiting' | 'in_progress' | 'finished';
  current_round: number;
  max_rounds: number;
  created_by: string;
};

export type Player = {
  id: string;
  game_id: string;
  user_id: string;
  name: string;
  score: number;
  color: string;
  is_host: boolean;
  created_at: string;
};

export type Word = {
  id: string;
  game_id: string;
  text: string;
  category: 'easy' | 'medium' | 'hard';
  column_index: number;
  row_index: number;
  is_claimed: boolean;
  claimed_by: string | null;
  created_at: string;
};

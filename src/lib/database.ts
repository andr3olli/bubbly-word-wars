import { supabase, type Game, type Player, type Word } from './supabase';

// Game operations
export const createGame = async (gameName: string, userId: string, playerName: string) => {
  const { data: game, error } = await supabase
    .from('games')
    .insert({
      name: gameName,
      status: 'waiting',
      current_round: 0,
      max_rounds: 3,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  
  // Add the host as a player
  const player = await addPlayer(game.id, userId, playerName, true);
  
  return { game, player };
};

export const getGame = async (gameId: string) => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  
  if (error) throw error;
  return data as Game;
};

// Player operations
export const addPlayer = async (gameId: string, userId: string, name: string, isHost = false) => {
  // Generate a random color for the player
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#E67E22', 
    '#2ECC71', '#3498DB'
  ];
  
  // Get existing player colors to avoid duplicates
  const { data: existingPlayers } = await supabase
    .from('players')
    .select('color')
    .eq('game_id', gameId);
    
  const usedColors = existingPlayers?.map(p => p.color) || [];
  const availableColors = colors.filter(c => !usedColors.includes(c));
  const color = availableColors.length > 0 
    ? availableColors[Math.floor(Math.random() * availableColors.length)]
    : `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
  
  const { data, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      user_id: userId,
      name,
      score: 0,
      color,
      is_host: isHost,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Player;
};

export const getPlayers = async (gameId: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data as Player[];
};

// Word operations
export const initializeWords = async (gameId: string) => {
  // Generate words for each category
  const easyWords = generateWords('easy', 5);
  const mediumWords = generateWords('medium', 5);
  const hardWords = generateWords('hard', 5);
  
  const words = [
    ...easyWords.map((word, i) => ({
      game_id: gameId,
      text: word,
      category: 'easy' as const,
      column_index: 0,
      row_index: i,
      is_claimed: false,
    })),
    ...mediumWords.map((word, i) => ({
      game_id: gameId,
      text: word,
      category: 'medium' as const,
      column_index: 1,
      row_index: i,
      is_claimed: false,
    })),
    ...hardWords.map((word, i) => ({
      game_id: gameId,
      text: word,
      category: 'hard' as const,
      column_index: 2,
      row_index: i,
      is_claimed: false,
    })),
  ];
  
  const { data, error } = await supabase
    .from('words')
    .insert(words)
    .select();
    
  if (error) throw error;
  return data as Word[];
};

export const claimWord = async (wordId: string, playerId: string) => {
  const { data: word, error: wordError } = await supabase
    .from('words')
    .select('*')
    .eq('id', wordId)
    .single();
    
  if (wordError) throw wordError;
  
  // Calculate points based on category
  let points = 0;
  switch(word.category) {
    case 'easy': points = 1; break;
    case 'medium': points = 2; break;
    case 'hard': points = 3; break;
  }
  
  // Start a transaction
  const { data, error } = await supabase.rpc('claim_word_and_update_score', {
    word_id: wordId,
    player_id: playerId,
    points: points
  });
  
  if (error) throw error;
  return data;
};

// Helper function to generate random words
const generateWords = (category: 'easy' | 'medium' | 'hard', count: number): string[] => {
  // In a real app, you might want to fetch these from a dictionary API
  const wordLists = {
    easy: [
      'Dog', 'Cat', 'Sun', 'Moon', 'Tree', 'Book', 'Car', 'House', 'Baby', 'Ball',
      'Bird', 'Fish', 'Milk', 'Cake', 'Star', 'Pen', 'Cup', 'Door', 'Rain', 'Hat'
    ],
    medium: [
      'Airport', 'Beauty', 'Camping', 'Digital', 'Evening', 'Freedom', 'Gravity',
      'History', 'Invoice', 'Journey', 'Kitchen', 'Lecture', 'Machine', 'Network'
    ],
    hard: [
      'Ambiguity', 'Bureaucracy', 'Carnivorous', 'Dichotomy', 'Eccentric',
      'Fortuitous', 'Gratuitous', 'Hypothesis', 'Indignation', 'Juxtaposition'
    ]
  };
  
  const words = [...wordLists[category]];
  const selected: string[] = [];
  
  while (selected.length < count && words.length > 0) {
    const index = Math.floor(Math.random() * words.length);
    selected.push(words.splice(index, 1)[0]);
  }
  
  return selected;
};

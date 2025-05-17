
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

// Types
export type Player = {
  id: string;
  name: string;
  score: number;
  color?: string;
};

export type Word = {
  id: string;
  text: string;
  category: "easy" | "medium" | "hard";
};

export type GameState = {
  id: string;
  name: string;
  players: Player[];
  words: Word[][];
  startTime: number;
  elapsedTime: number;
  isActive: boolean;
};

type GameContextType = {
  gameState: GameState | null;
  playerName: string;
  setPlayerName: (name: string) => void;
  gameName: string;
  setGameName: (name: string) => void;
  gameId: string;
  setGameId: (id: string) => void;
  createGame: () => void;
  joinGame: () => void;
  selectWord: (wordId: string, category: "easy" | "medium" | "hard", columnIndex: number, rowIndex: number) => void;
  resetGame: () => void;
  currentPlayerId: string | null;
  isLoading: boolean;
};

const defaultGameContext: GameContextType = {
  gameState: null,
  playerName: "",
  setPlayerName: () => {},
  gameName: "",
  setGameName: () => {},
  gameId: "",
  setGameId: () => {},
  createGame: () => {},
  joinGame: () => {},
  selectWord: () => {},
  resetGame: () => {},
  currentPlayerId: null,
  isLoading: false,
};

const GameContext = createContext<GameContextType>(defaultGameContext);

// Mock words for each category
const easyWords = [
  "Dog", "Cat", "Sun", "Moon", "Tree", "Book", "Car", "House", "Baby", 
  "Ball", "Bird", "Fish", "Milk", "Cake", "Star", "Pen", "Cup", "Door", 
  "Rain", "Snow", "Hat", "Shoe", "Bed", "Food", "Game"
];

const mediumWords = [
  "Airport", "Beauty", "Camping", "Digital", "Evening", "Freedom", "Gravity", 
  "History", "Invoice", "Journey", "Kitchen", "Lecture", "Machine", "Network", 
  "October", "Passion", "Quality", "Rainbow", "Science", "Traffic", "Umbrella", 
  "Village", "Website", "Yearbook", "Zeppelin"
];

const hardWords = [
  "Ambiguity", "Bureaucracy", "Carnivorous", "Dichotomy", "Eccentric", 
  "Fortuitous", "Gratuitous", "Hypothesis", "Indignation", "Juxtaposition", 
  "Kaleidoscope", "Labyrinthine", "Mercurial", "Nefarious", "Obfuscation", 
  "Paralogism", "Quintessence", "Recalcitrant", "Sycophantic", "Tangential", 
  "Ubiquitous", "Verisimilitude", "Whimsical", "Xenophobia", "Zealotry"
];

// Helper to generate random words
const getRandomWords = (category: "easy" | "medium" | "hard", count: number): Word[] => {
  let wordBank: string[];
  
  switch(category) {
    case "easy": wordBank = easyWords; break;
    case "medium": wordBank = mediumWords; break;
    case "hard": wordBank = hardWords; break;
    default: wordBank = easyWords;
  }
  
  return Array.from({ length: count }, () => {
    const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      text: randomWord,
      category
    };
  });
};

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState("");
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize the game
  const createGame = () => {
    if (!playerName || !gameName) {
      toast.error("Please enter your name and game name");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newGameId = Math.random().toString(36).substr(2, 6).toUpperCase();
      const playerId = Math.random().toString(36).substr(2, 9);
      setCurrentPlayerId(playerId);
      
      // Generate initial words for each category
      const words = [
        getRandomWords("easy", 5),
        getRandomWords("medium", 5),
        getRandomWords("hard", 5)
      ];
      
      const newGameState: GameState = {
        id: newGameId,
        name: gameName,
        players: [
          {
            id: playerId,
            name: playerName,
            score: 0,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          }
        ],
        words,
        startTime: Date.now(),
        elapsedTime: 0,
        isActive: true
      };
      
      setGameState(newGameState);
      setGameId(newGameId);
      setIsLoading(false);
      toast.success("Game created successfully!");
    }, 1000);
  };
  
  const joinGame = () => {
    if (!playerName || !gameId) {
      toast.error("Please enter your name and game ID");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // In a real app, we'd fetch the game state from the server
      // For now, we'll create a mock game
      const playerId = Math.random().toString(36).substr(2, 9);
      setCurrentPlayerId(playerId);
      
      // Generate initial words for each category (in a real app these would be synced)
      const words = [
        getRandomWords("easy", 5),
        getRandomWords("medium", 5),
        getRandomWords("hard", 5)
      ];
      
      const mockExistingPlayers: Player[] = [
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "Player 1",
          score: Math.floor(Math.random() * 12),
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "Player 2",
          score: Math.floor(Math.random() * 10),
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }
      ];
      
      const newGameState: GameState = {
        id: gameId,
        name: "Joined Game", // In real app, we'd get this from the server
        players: [
          ...mockExistingPlayers,
          {
            id: playerId,
            name: playerName,
            score: 0,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          }
        ],
        words,
        startTime: Date.now() - 300000, // 5 minutes earlier to simulate a game in progress
        elapsedTime: 300000,
        isActive: true
      };
      
      setGameState(newGameState);
      setIsLoading(false);
      toast.success("Joined game successfully!");
    }, 1500);
  };
  
  const selectWord = (wordId: string, category: "easy" | "medium" | "hard", columnIndex: number, rowIndex: number) => {
    if (!gameState || !currentPlayerId) return;
    
    // Find the player
    const playerIndex = gameState.players.findIndex(p => p.id === currentPlayerId);
    if (playerIndex === -1) return;
    
    // Determine score based on category
    let pointsToAdd = 0;
    switch(category) {
      case "easy": pointsToAdd = 1; break;
      case "medium": pointsToAdd = 2; break;
      case "hard": pointsToAdd = 3; break;
    }
    
    // Update player score
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      score: updatedPlayers[playerIndex].score + pointsToAdd
    };
    
    // Replace the selected word with a new one
    const updatedWords = [...gameState.words];
    const newWord = getRandomWords(category, 1)[0];
    updatedWords[columnIndex][rowIndex] = newWord;
    
    // Update game state
    setGameState({
      ...gameState,
      players: updatedPlayers,
      words: updatedWords
    });
    
    // Toast with the point gained
    toast.success(`+${pointsToAdd} points!`);
  };
  
  // Reset game state
  const resetGame = () => {
    setGameState(null);
    setCurrentPlayerId(null);
  };
  
  // Update elapsed time
  useEffect(() => {
    if (!gameState?.isActive) return;
    
    const interval = setInterval(() => {
      if (gameState) {
        setGameState({
          ...gameState,
          elapsedTime: Date.now() - gameState.startTime
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  return (
    <GameContext.Provider
      value={{
        gameState,
        playerName,
        setPlayerName,
        gameName,
        setGameName,
        gameId,
        setGameId,
        createGame,
        joinGame,
        selectWord,
        resetGame,
        currentPlayerId,
        isLoading
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

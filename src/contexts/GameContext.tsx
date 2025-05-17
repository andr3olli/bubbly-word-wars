
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useSocket } from "./SocketContext";

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

export type SelectedWord = {
  wordId: string;
  category: "easy" | "medium" | "hard";
  columnIndex: number;
  rowIndex: number;
  playerId: string;
  progress: number;
};

export type GameState = {
  id: string;
  name: string;
  players: Player[];
  words: Word[][];
  startTime: number;
  elapsedTime: number;
  isActive: boolean;
  selectedWord: SelectedWord | null;
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
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState("");
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Game created event
    socket.on('game-created', ({ gameId, gameState }) => {
      setGameState(gameState);
      setGameId(gameId);
      setIsLoading(false);
      toast.success("Game created successfully!");
    });
    
    // Game joined event
    socket.on('game-joined', ({ gameState }) => {
      setGameState(gameState);
      setIsLoading(false);
      toast.success("Joined game successfully!");
    });
    
    // Game updated event (players joined, scores changed, etc.)
    socket.on('game-updated', (updatedGameState) => {
      setGameState(updatedGameState);
    });
    
    // Word selected event
    socket.on('word-selected', (gameState) => {
      setGameState(gameState);
    });
    
    // Progress updated event
    socket.on('progress-updated', (gameState) => {
      setGameState(gameState);
    });
    
    return () => {
      // Clean up listeners when component unmounts
      socket.off('game-created');
      socket.off('game-joined');
      socket.off('game-updated');
      socket.off('word-selected');
      socket.off('progress-updated');
    };
  }, [socket]);
  
  // Initialize the game
  const createGame = () => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }
    
    if (!playerName || !gameName) {
      toast.error("Please enter your name and game name");
      return;
    }
    
    setIsLoading(true);
    
    // Generate a random player ID
    const playerId = Math.random().toString(36).substr(2, 9);
    setCurrentPlayerId(playerId);
    
    // Create a player object
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    // Send create game request to server
    socket.emit('create-game', { gameName, player });
  };
  
  const joinGame = () => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }
    
    if (!playerName || !gameId) {
      toast.error("Please enter your name and game ID");
      return;
    }
    
    setIsLoading(true);
    
    // Generate a random player ID
    const playerId = Math.random().toString(36).substr(2, 9);
    setCurrentPlayerId(playerId);
    
    // Create a player object
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    // Send join game request to server
    socket.emit('join-game', { gameId, player });
  };
  
  const selectWord = (wordId: string, category: "easy" | "medium" | "hard", columnIndex: number, rowIndex: number) => {
    if (!gameState || !currentPlayerId || gameState.selectedWord) return;
    if (!socket || !isConnected) {
      toast.error("Not connected to server");
      return;
    }
    
    // Send the word selection to the server
    socket.emit('select-word', {
      gameId: gameState.id,
      wordId,
      category,
      columnIndex,
      rowIndex,
      playerId: currentPlayerId
    });
    
    // Animation locally
    const animationDuration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Send progress updates to server
      socket.emit('word-progress', {
        gameId: gameState.id,
        progress: progress * 100
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Word completion - notify server
        socket.emit('word-completed', {
          gameId: gameState.id,
          wordId,
          category,
          columnIndex,
          rowIndex,
          playerId: currentPlayerId
        });
        
        // Toast with the point gained
        let pointsToAdd = 0;
        switch(category) {
          case "easy": pointsToAdd = 1; break;
          case "medium": pointsToAdd = 2; break;
          case "hard": pointsToAdd = 3; break;
        }
        toast.success(`+${pointsToAdd} points!`);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  // Reset game state
  const resetGame = () => {
    setGameState(null);
    setCurrentPlayerId(null);
  };
  
  // Update elapsed time and sync with server
  useEffect(() => {
    if (!gameState?.isActive || !socket) return;
    
    const interval = setInterval(() => {
      if (gameState) {
        const updatedElapsedTime = Date.now() - gameState.startTime;
        
        // Update local state
        setGameState({
          ...gameState,
          elapsedTime: updatedElapsedTime
        });
        
        // Sync with server occasionally
        if (currentPlayerId === gameState.players[0]?.id) {
          socket.emit('update-time', {
            gameId: gameState.id,
            elapsedTime: updatedElapsedTime
          });
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState, socket, currentPlayerId]);
  
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

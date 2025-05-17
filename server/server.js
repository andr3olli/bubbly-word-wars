const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active games
const activeGames = new Map();

// Helper to generate random words
const getRandomWords = (category, count) => {
  // Word banks
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
  
  let wordBank;
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

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new game
  socket.on('create-game', ({ gameName, player }) => {
    // Generate a 6-character game ID
    const gameId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Generate initial words for each category
    const words = [
      getRandomWords("easy", 5),
      getRandomWords("medium", 5),
      getRandomWords("hard", 5)
    ];
    
    // Initialize game state with the creator as first player
    const gameState = {
      id: gameId,
      name: gameName,
      players: [player],
      words: words,
      startTime: Date.now(),
      elapsedTime: 0,
      isActive: true,
      selectedWord: null
    };
    
    // Store the game
    activeGames.set(gameId, gameState);
    
    // Join the socket to a room with the game ID
    socket.join(gameId);
    
    // Send game creation confirmation
    socket.emit('game-created', { gameId, gameState });
    console.log(`Game created: ${gameId}`);
  });

  // Join an existing game
  socket.on('join-game', ({ gameId, player }) => {
    const gameState = activeGames.get(gameId);
    
    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Add the player to the game
    gameState.players.push(player);
    
    // Join the socket to the game room
    socket.join(gameId);
    
    // Send updated game state to all players in the room
    io.to(gameId).emit('game-updated', gameState);
    
    // Send join confirmation to the new player
    socket.emit('game-joined', { gameState });
    console.log(`Player ${player.name} joined game: ${gameId}`);
  });

  // Word selection event
  socket.on('select-word', ({ gameId, wordId, category, columnIndex, rowIndex, playerId }) => {
    const gameState = activeGames.get(gameId);
    
    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Update game state with selected word
    gameState.selectedWord = {
      wordId,
      category,
      columnIndex,
      rowIndex,
      playerId,
      progress: 0
    };
    
    // Broadcast the selection to all players
    io.to(gameId).emit('word-selected', gameState);
  });

  // Word progress update
  socket.on('word-progress', ({ gameId, progress }) => {
    const gameState = activeGames.get(gameId);
    
    if (!gameState || !gameState.selectedWord) {
      return;
    }
    
    // Update progress
    gameState.selectedWord.progress = progress;
    
    // Broadcast progress to all players
    io.to(gameId).emit('progress-updated', gameState);
  });

  // Word completion event
  socket.on('word-completed', ({ gameId, wordId, category, columnIndex, rowIndex, playerId }) => {
    const gameState = activeGames.get(gameId);
    
    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Find the player and update their score
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      // Determine points based on category
      let pointsToAdd = 0;
      switch(category) {
        case "easy": pointsToAdd = 1; break;
        case "medium": pointsToAdd = 2; break;
        case "hard": pointsToAdd = 3; break;
      }
      
      // Update player score
      gameState.players[playerIndex].score += pointsToAdd;
    }
    
    // Generate a new word to replace the completed one
    const newWord = getRandomWords(category, 1)[0];
    gameState.words[columnIndex][rowIndex] = newWord;
    
    // Reset the selected word
    gameState.selectedWord = null;
    
    // Broadcast the updated game state
    io.to(gameId).emit('game-updated', gameState);
  });

  // Update game time
  socket.on('update-time', ({ gameId, elapsedTime }) => {
    const gameState = activeGames.get(gameId);
    if (gameState) {
      gameState.elapsedTime = elapsedTime;
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // In a more complete implementation, you would:
    // 1. Find all games the user is in
    // 2. Remove them from those games
    // 3. Notify other players
    // 4. Clean up empty games
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

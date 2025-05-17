
import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import TopBar from "./TopBar";
import PlayerList from "./PlayerList";
import GameBoard from "./GameBoard";
import { Button } from "@/components/ui/button";

const Game: React.FC = () => {
  const { gameState, resetGame } = useGameContext();
  
  if (!gameState) return null;
  
  return (
    <div className="w-full flex flex-col h-screen">
      <div className="flex items-center justify-between">
        <TopBar />
      </div>
      
      <PlayerList />
      
      <GameBoard />
      
      <div className="flex justify-center mt-3 mb-3">
        <Button variant="outline" onClick={resetGame}>
          Exit Game
        </Button>
      </div>
    </div>
  );
};

export default Game;

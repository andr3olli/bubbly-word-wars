
import React from "react";
import { GameProvider, useGameContext } from "@/contexts/GameContext";
import GameLobby from "@/components/GameLobby";
import Game from "@/components/Game";

const GameContainer: React.FC = () => {
  const { gameState } = useGameContext();
  
  return (
    <div className="w-full">
      {!gameState ? <GameLobby /> : <Game />}
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="container max-w-6xl">
        <GameProvider>
          <GameContainer />
        </GameProvider>
      </div>
    </div>
  );
};

export default Index;

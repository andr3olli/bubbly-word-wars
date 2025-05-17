
import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import { User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

const PlayerCard: React.FC<{
  name: string;
  score: number;
  isCurrentPlayer: boolean;
  color?: string;
}> = ({ name, score, isCurrentPlayer, color = "#4ade80" }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex flex-col items-center p-3 min-w-[100px] bg-secondary/60 backdrop-blur-sm rounded-xl border-2 mx-2`}
      style={{
        borderColor: isCurrentPlayer ? color : `${color}80`,
        boxShadow: isCurrentPlayer ? `0 0 0 2px ${color}40` : 'none'
      }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: color + "33" }} // Adding transparency
      >
        <User className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-sm font-medium truncate max-w-[80px]">{name}</div>
      <div className="text-xs text-primary font-semibold">{score} pts</div>
    </motion.div>
  );
};

const PlayerList: React.FC = () => {
  const { gameState, currentPlayerId } = useGameContext();
  
  if (!gameState) return null;
  
  return (
    <div className="w-full py-4">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4 px-2">
          {gameState.players.map((player) => (
            <PlayerCard
              key={player.id}
              name={player.name}
              score={player.score}
              isCurrentPlayer={player.id === currentPlayerId}
              color={player.color}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerList;

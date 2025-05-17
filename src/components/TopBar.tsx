
import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const TopBar: React.FC = () => {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;
  
  // Format elapsed time
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const copyGameId = () => {
    navigator.clipboard.writeText(gameState.id);
    toast.success("Game ID copied to clipboard!");
  };
  
  return (
    <div className="w-full flex justify-between items-center p-4 bg-secondary/50 backdrop-blur-md rounded-xl border border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold glow">{gameState.name}</h1>
        <div className="hidden sm:block text-sm text-muted-foreground">
          Time: <span className="text-primary">{formatTime(gameState.elapsedTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm px-3 py-1 bg-secondary rounded-lg border border-border">
          ID: <span className="font-mono text-primary">{gameState.id}</span>
        </div>
        <Button variant="outline" size="icon" onClick={copyGameId}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;

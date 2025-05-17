
import React, { useEffect, useMemo, useState } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

interface WordCardProps {
  id: string;
  text: string;
  category: "easy" | "medium" | "hard";
  columnIndex: number;
  rowIndex: number;
  compact?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ id, text, category, columnIndex, rowIndex, compact = false }) => {
  const { selectWord, gameState, currentPlayerId } = useGameContext();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if this word is currently being processed
  const isBeingProcessed = useMemo(() => {
    if (!gameState?.selectedWord) return false;
    return (
      gameState.selectedWord.wordId === id &&
      gameState.selectedWord.columnIndex === columnIndex &&
      gameState.selectedWord.rowIndex === rowIndex
    );
  }, [gameState?.selectedWord, id, columnIndex, rowIndex]);
  
  // Get the player who is processing this word
  const processingPlayer = useMemo(() => {
    if (!isBeingProcessed || !gameState?.selectedWord) return null;
    return gameState.players.find(p => p.id === gameState.selectedWord?.playerId);
  }, [isBeingProcessed, gameState]);
  
  // Get the progress of the current processing (0-100)
  const progress = useMemo(() => {
    if (!isBeingProcessed || !gameState?.selectedWord) return 0;
    return gameState.selectedWord.progress;
  }, [isBeingProcessed, gameState?.selectedWord]);
  
  const getBorderColor = () => {
    if (isBeingProcessed && processingPlayer) {
      return "border-primary";
    }
    
    switch(category) {
      case "easy": return "border-game-easy";
      case "medium": return "border-game-medium";
      case "hard": return "border-game-hard";
      default: return "border-primary";
    }
  };
  
  const getGlowColor = () => {
    if (isBeingProcessed && processingPlayer) {
      return `0 0 15px ${processingPlayer.color}80`;
    }
    
    switch(category) {
      case "easy": return "0 0 10px rgba(74, 222, 128, 0.5)";
      case "medium": return "0 0 10px rgba(251, 146, 60, 0.5)";
      case "hard": return "0 0 10px rgba(248, 113, 113, 0.5)";
      default: return "0 0 10px rgba(255, 255, 255, 0.5)";
    }
  };
  
  const handleClick = () => {
    if (isProcessing || isBeingProcessed || !currentPlayerId) return;
    
    setIsProcessing(true);
    selectWord(id, category, columnIndex, rowIndex);
    
    // Reset processing state after the animation duration
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };
  
  const isLongText = text.length > 9;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`${compact ? 'h-14' : 'h-28'} game-card ${getBorderColor()} relative overflow-hidden`} 
          onClick={handleClick}
          style={{ 
            boxShadow: getGlowColor(),
            opacity: isBeingProcessed || isProcessing ? 0.9 : 1,
            transition: 'opacity 0.2s ease',
            cursor: isBeingProcessed || isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {(isProcessing || isBeingProcessed) && (
            <div 
              className="absolute inset-0 transition-all duration-100 ease-linear opacity-30"
              style={{
                width: `${isBeingProcessed ? progress : 100}%`,
                backgroundColor: processingPlayer?.color || 'hsl(var(--primary))',
                transition: isBeingProcessed ? 'none' : 'width 1s linear',
                zIndex: 0,
                borderTopRightRadius: '0.5rem',
                borderBottomRightRadius: '0.5rem'
              }}
            />
          )}
          
          <div className="text-center w-full overflow-hidden relative z-10">
            <p className={`font-medium ${compact ? 'text-sm' : 'text-lg'} word-text`}>{text}</p>
          </div>
        </div>
      </TooltipTrigger>
      {isLongText && (
        <TooltipContent side="top" className="bg-background border border-border p-2 rounded shadow-md">
          {text}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default WordCard;

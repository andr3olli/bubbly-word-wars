
import React, { useState } from "react";
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
  const { selectWord } = useGameContext();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const getBorderColor = () => {
    switch(category) {
      case "easy": return "border-game-easy";
      case "medium": return "border-game-medium";
      case "hard": return "border-game-hard";
      default: return "border-primary";
    }
  };
  
  const getGlowColor = () => {
    switch(category) {
      case "easy": return "0 0 10px rgba(74, 222, 128, 0.5)";
      case "medium": return "0 0 10px rgba(251, 146, 60, 0.5)";
      case "hard": return "0 0 10px rgba(248, 113, 113, 0.5)";
      default: return "0 0 10px rgba(255, 255, 255, 0.5)";
    }
  };
  
  const handleClick = () => {
    if (isProcessing) return;
    
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
          className={`${compact ? 'h-14' : 'h-28'} game-card ${getBorderColor()}`} 
          onClick={handleClick}
          style={{ boxShadow: getGlowColor() }}
        >
          {isProcessing && (
            <div className="absolute top-0 left-0 h-1 bg-primary animate-progress"></div>
          )}
          
          <div className="text-center w-full overflow-hidden">
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


import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import WordCard from "./WordCard";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";
import { ScrollArea } from "./ui/scroll-area";

const GameBoard: React.FC = () => {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;
  
  const { words, players } = gameState;
  
  // Prepare data for the bar chart
  const chartData = players.map((player) => ({
    name: player.name,
    score: player.score,
    color: player.color || "#4ade80"
  }));
  
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 h-[calc(100vh-220px)]">
      {/* Words Section */}
      <div className="card-gradient rounded-xl border border-border p-3">
        <h2 className="text-xl font-bold mb-2">Words</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Easy Column */}
          <div>
            <h3 className="text-sm font-medium text-game-easy mb-2 flex justify-between">
              <span>Easy</span>
              <span>1 point</span>
            </h3>
            <div className="space-y-2">
              {words[0].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="easy"
                  columnIndex={0}
                  rowIndex={index}
                  compact={true}
                />
              ))}
            </div>
          </div>
          
          {/* Medium Column */}
          <div>
            <h3 className="text-sm font-medium text-game-medium mb-2 flex justify-between">
              <span>Medium</span>
              <span>2 points</span>
            </h3>
            <div className="space-y-2">
              {words[1].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="medium"
                  columnIndex={1}
                  rowIndex={index}
                  compact={true}
                />
              ))}
            </div>
          </div>
          
          {/* Hard Column */}
          <div>
            <h3 className="text-sm font-medium text-game-hard mb-2 flex justify-between">
              <span>Hard</span>
              <span>3 points</span>
            </h3>
            <div className="space-y-2">
              {words[2].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="hard"
                  columnIndex={2}
                  rowIndex={index}
                  compact={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scores Section */}
      <div className="card-gradient rounded-xl border border-border p-3">
        <h2 className="text-xl font-bold mb-2">Scores</h2>
        
        <div className="w-full h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="horizontal"
              barGap={10}
              barCategoryGap={20}
            >
              <YAxis 
                type="number" 
                domain={[0, 'dataMax + 5']} 
              />
              <XAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 30, 30, 0.8)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)' 
                }}
                formatter={(value) => [`${value} points`]}
              />
              <Bar 
                dataKey="score" 
                isAnimationActive={true}
                animationDuration={500}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;

import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import WordCard from "./WordCard";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

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
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      {/* Words Section */}
      <div className="card-gradient rounded-xl border border-border p-4">
        <h2 className="text-xl font-bold mb-4">Words</h2>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Easy Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-game-easy">Easy</h3>
            <div className="space-y-3">
              {words[0].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="easy"
                  columnIndex={0}
                  rowIndex={index}
                />
              ))}
            </div>
          </div>
          
          {/* Medium Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-game-medium">Medium</h3>
            <div className="space-y-3">
              {words[1].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="medium"
                  columnIndex={1}
                  rowIndex={index}
                />
              ))}
            </div>
          </div>
          
          {/* Hard Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-game-hard">Hard</h3>
            <div className="space-y-3">
              {words[2].map((word, index) => (
                <WordCard
                  key={word.id}
                  id={word.id}
                  text={word.text}
                  category="hard"
                  columnIndex={2}
                  rowIndex={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scores Section */}
      <div className="card-gradient rounded-xl border border-border p-4">
        <h2 className="text-xl font-bold mb-4">Scores</h2>
        
        <div className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" domain={[0, 'dataMax + 5']} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
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

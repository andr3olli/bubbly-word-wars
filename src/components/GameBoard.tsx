
import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import WordCard from "./WordCard";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";
import { ScrollArea } from "./ui/scroll-area";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

const GameBoard: React.FC = () => {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;
  
  const { words, players } = gameState;
  
  // Prepare data for the bar chart with consistent colors
  const chartData = players.map((player) => ({
    name: player.name,
    score: player.score,
    color: player.color || "#4ade80",
    // Add a slightly darker color for the border
    borderColor: `${player.color || "#4ade80"}cc`
  }));
  
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 flex-1">
      {/* Words Section */}
      <div className="card-gradient rounded-xl border border-border p-3">
        <h2 className="text-xl font-bold mb-2">Words</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Easy Column */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex justify-between">
              <span>Easy</span>
              <span className="text-xs text-muted-foreground">1 point</span>
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
            <h3 className="text-sm font-medium mb-2 flex justify-between">
              <span>Medium</span>
              <span className="text-xs text-muted-foreground">2 points</span>
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
            <h3 className="text-sm font-medium mb-2 flex justify-between">
              <span>Hard</span>
              <span className="text-xs text-muted-foreground">3 points</span>
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
          <BarChart 
            className="no-hover-effect"
            width={500}
            height={300}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barGap={8}
            barCategoryGap={16}
          >
            <XAxis 
              dataKey="name" 
              type="category"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="number"
              domain={[0, (dataMax: number) => Math.max(dataMax * 1.1, 10)]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} pts`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 30, 30, 0.9)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '8px 12px'
              }}
              formatter={(value) => [`${value} points`]}
              labelFormatter={(name) => `Player: ${name}`}
            />
            <Bar 
              dataKey="score" 
              isAnimationActive={false}
              barSize={40}
              radius={[4, 4, 0, 0]}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.borderColor}
                  strokeWidth={1}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    opacity: 1,
                    transition: 'none',
                    pointerEvents: 'none'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;

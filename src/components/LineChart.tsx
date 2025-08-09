import React from 'react';
import { DataPoint, ForecastPoint } from '../types';

interface LineChartProps {
  data: DataPoint[];
  forecast?: ForecastPoint[];
  width?: number;
  height?: number;
  showConfidenceInterval?: boolean;
}

export function LineChart({ 
  data, 
  forecast, 
  width = 800, 
  height = 300,
  showConfidenceInterval = true 
}: LineChartProps) {
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Combine data for scaling
  const allData = [...data];
  if (forecast) {
    const forecastAsData = forecast.map(f => ({
      ...data[0], // Use first data point as template
      timestamp: f.timestamp,
      demand: f.predicted
    }));
    allData.push(...forecastAsData);
  }
  
  const minDemand = Math.min(...allData.map(d => d.demand)) * 0.9;
  const maxDemand = Math.max(...allData.map(d => d.demand)) * 1.1;
  
  const minTime = Math.min(...allData.map(d => d.timestamp.getTime()));
  const maxTime = Math.max(...allData.map(d => d.timestamp.getTime()));
  
  const xScale = (timestamp: Date) => 
    ((timestamp.getTime() - minTime) / (maxTime - minTime)) * chartWidth;
  
  const yScale = (demand: number) => 
    chartHeight - ((demand - minDemand) / (maxDemand - minDemand)) * chartHeight;
  
  // Generate path for historical data
  const historicalPath = data.reduce((path, point, index) => {
    const x = xScale(point.timestamp);
    const y = yScale(point.demand);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');
  
  // Generate path for forecast
  let forecastPath = '';
  let confidencePath = '';
  
  if (forecast && forecast.length > 0) {
    forecastPath = forecast.reduce((path, point, index) => {
      const x = xScale(point.timestamp);
      const y = yScale(point.predicted);
      return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, '');
    
    if (showConfidenceInterval) {
      const upperPath = forecast.reduce((path, point, index) => {
        const x = xScale(point.timestamp);
        const y = yScale(point.confidence.upper);
        return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }, '');
      
      const lowerPath = forecast.reduceRight((path, point, index) => {
        const x = xScale(point.timestamp);
        const y = yScale(point.confidence.lower);
        return path + (index === forecast.length - 1 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }, '');
      
      confidencePath = upperPath + ' ' + lowerPath + ' Z';
    }
  }
  
  // Generate y-axis ticks
  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const value = minDemand + (maxDemand - minDemand) * (i / 5);
    yTicks.push({
      value: Math.round(value),
      y: yScale(value)
    });
  }
  
  // Generate x-axis ticks
  const xTicks = [];
  for (let i = 0; i <= 6; i++) {
    const timestamp = new Date(minTime + (maxTime - minTime) * (i / 6));
    xTicks.push({
      label: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      x: xScale(timestamp)
    });
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <svg width={width} height={height} className="text-gray-300">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={0}
              y1={tick.y}
              x2={chartWidth}
              y2={tick.y}
              stroke="#374151"
              strokeDasharray="2,2"
              opacity={0.5}
            />
          ))}
          
          {/* Confidence interval */}
          {confidencePath && (
            <path
              d={confidencePath}
              fill="rgba(14, 165, 233, 0.2)"
              stroke="none"
            />
          )}
          
          {/* Historical data line */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#10B981"
            strokeWidth={2}
          />
          
          {/* Forecast line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}
          
          {/* Y-axis */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#6B7280" />
          {yTicks.map((tick, i) => (
            <g key={i}>
              <text
                x={-10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-xs fill-gray-400"
              >
                {tick.value}
              </text>
            </g>
          ))}
          
          {/* X-axis */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#6B7280" />
          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={tick.x}
              y={chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {tick.label}
            </text>
          ))}
        </g>
      </svg>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-sm text-gray-300">Historical</span>
        </div>
        {forecast && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-400 border-dashed border-t-2"></div>
              <span className="text-sm text-gray-300">Forecast</span>
            </div>
            {showConfidenceInterval && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-blue-400 bg-opacity-20"></div>
                <span className="text-sm text-gray-300">Confidence</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
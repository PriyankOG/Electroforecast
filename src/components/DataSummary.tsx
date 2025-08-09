import React from 'react';
import { DataPoint } from '../types';
import { Calendar, Thermometer, Droplets, Wind, TrendingUp } from 'lucide-react';

interface DataSummaryProps {
  data: DataPoint[];
}

export function DataSummary({ data }: DataSummaryProps) {
  const latestData = data[data.length - 1];
  const avgDemand = data.reduce((sum, d) => sum + d.demand, 0) / data.length;
  const maxDemand = Math.max(...data.map(d => d.demand));
  const minDemand = Math.min(...data.map(d => d.demand));
  
  const peakHours = data
    .filter(d => d.demand > avgDemand * 1.2)
    .reduce((acc, d) => {
      const hour = d.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
  const topPeakHour = Object.entries(peakHours)
    .sort(([,a], [,b]) => b - a)[0];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">Current Demand</p>
            <p className="text-2xl font-bold text-white">{latestData.demand.toLocaleString()} MW</p>
            <p className="text-xs text-gray-400">
              {latestData.demand > avgDemand ? '↗️ Above' : '↘️ Below'} average
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-green-400" />
          <div>
            <p className="text-sm text-gray-400">Peak Hour</p>
            <p className="text-2xl font-bold text-white">
              {topPeakHour ? `${topPeakHour[0]}:00` : 'N/A'}
            </p>
            <p className="text-xs text-gray-400">Most frequent peak</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3">
          <Thermometer className="w-8 h-8 text-red-400" />
          <div>
            <p className="text-sm text-gray-400">Temperature</p>
            <p className="text-2xl font-bold text-white">{latestData.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-gray-400">Current conditions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <Wind className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Weather</p>
            <p className="text-lg font-bold text-white">
              {latestData.humidity}% | {latestData.windSpeed}m/s
            </p>
            <p className="text-xs text-gray-400">Humidity | Wind</p>
          </div>
        </div>
      </div>
    </div>
  );
}
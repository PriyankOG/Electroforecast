import React from 'react';
import { ModelMetrics } from '../types';
import { TrendingUp, Target, BarChart3, Activity } from 'lucide-react';

interface MetricsCardProps {
  metrics: ModelMetrics;
  modelName: string;
}

export function MetricsCard({ metrics, modelName }: MetricsCardProps) {
  const getMetricColor = (value: number, type: 'error' | 'accuracy') => {
    if (type === 'error') {
      if (value < 5) return 'text-green-400';
      if (value < 15) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value > 0.9) return 'text-green-400';
      if (value > 0.7) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{modelName}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <Target className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">MAPE</p>
            <p className={`text-lg font-bold ${getMetricColor(metrics.mape, 'error')}`}>
              {metrics.mape.toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">RMSE</p>
            <p className={`text-lg font-bold ${getMetricColor(metrics.rmse, 'error')}`}>
              {metrics.rmse}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">MAE</p>
            <p className={`text-lg font-bold ${getMetricColor(metrics.mae, 'error')}`}>
              {metrics.mae}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">R²</p>
            <p className={`text-lg font-bold ${getMetricColor(metrics.r2, 'accuracy')}`}>
              {metrics.r2.toFixed(3)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
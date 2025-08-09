import React from 'react';

interface FeatureImportanceProps {
  features: string[];
  importance: number[];
}

export function FeatureImportance({ features, importance }: FeatureImportanceProps) {
  const maxImportance = Math.max(...importance);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Feature Importance</h3>
      
      <div className="space-y-3">
        {features.map((feature, index) => {
          const normalizedImportance = importance[index] / maxImportance;
          const percentage = (normalizedImportance * 100).toFixed(1);
          
          return (
            <div key={feature} className="flex items-center space-x-3">
              <div className="w-32 text-sm text-gray-300 truncate">{feature}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${normalizedImportance * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-400 text-right">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
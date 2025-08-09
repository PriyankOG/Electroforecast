import React, { useState, useEffect } from 'react';
import { DataPoint, ModelResult } from './types';
import { DataGenerator } from './utils/dataGenerator';
import { ForecastingModels } from './utils/forecastModels';
import { LineChart } from './components/LineChart';
import { DataSummary } from './components/DataSummary';
import { ModelComparison } from './components/ModelComparison';
import { Zap, RefreshCw, Download, Settings } from 'lucide-react';

function App() {
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [models, setModels] = useState<ModelResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('Prophet-like');
  const [isLoading, setIsLoading] = useState(false);
  const [forecastHours, setForecastHours] = useState(168); // 1 week

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    
    // Generate historical data
    const data = DataGenerator.generateHistoricalData(90); // 3 months
    setHistoricalData(data);
    
    // Generate forecasts from all models
    const prophetModel = ForecastingModels.prophetLike(data, forecastHours);
    const arimaModel = ForecastingModels.arimaLike(data, forecastHours);
    const lstmModel = ForecastingModels.lstmInspired(data, forecastHours);
    
    setModels([prophetModel, arimaModel, lstmModel]);
    setIsLoading(false);
  };

  const refreshForecasts = () => {
    initializeData();
  };

  const exportData = () => {
    const selectedModelData = models.find(m => m.name === selectedModel);
    if (!selectedModelData) return;
    
    const exportData = {
      historicalData: historicalData.slice(-168), // Last week
      forecast: selectedModelData.forecast,
      metrics: selectedModelData.metrics,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electricity_forecast_${selectedModel.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedModelData = models.find(m => m.name === selectedModel);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">ElectroForecast</h1>
                <p className="text-sm text-gray-400">Predictive Analytics for Electricity Demand</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <select
                  value={forecastHours}
                  onChange={(e) => setForecastHours(Number(e.target.value))}
                  className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600"
                >
                  <option value={24}>1 Day</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                  <option value={336}>2 Weeks</option>
                </select>
              </div>
              
              <button
                onClick={refreshForecasts}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Summary */}
        {historicalData.length > 0 && <DataSummary data={historicalData} />}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-400">Generating forecasts...</p>
            </div>
          </div>
        )}

        {/* Main Chart */}
        {!isLoading && historicalData.length > 0 && models.length > 0 && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Demand Forecast</h2>
                <div className="flex space-x-2">
                  {models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => setSelectedModel(model.name)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedModel === model.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <LineChart
                data={historicalData.slice(-336)} // Last 2 weeks for context
                forecast={selectedModelData?.forecast}
                width={1000}
                height={400}
                showConfidenceInterval={true}
              />
              
              {selectedModelData && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <p>
                    Showing {historicalData.slice(-336).length} hours of historical data 
                    and {selectedModelData.forecast.length} hours of forecast
                  </p>
                  <p>
                    Model Accuracy: <span className="text-green-400 font-semibold">
                      {selectedModelData.metrics.mape.toFixed(2)}% MAPE
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Model Comparison */}
            <ModelComparison models={models} />

            {/* Analytics Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <p>Peak demand typically occurs between 6-9 PM during weekdays</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <p>Weather patterns show strong correlation with demand (R² {'>'} 0.8)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <p>Weekend demand is consistently 15% lower than weekdays</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p>Seasonal variations show 30% increase during summer months</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Business Impact</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Cost Reduction</span>
                    <span className="text-green-400 font-semibold">15-20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Forecast Accuracy</span>
                    <span className="text-blue-400 font-semibold">95%+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Grid Reliability</span>
                    <span className="text-purple-400 font-semibold">Improved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Energy Purchasing</span>
                    <span className="text-yellow-400 font-semibold">Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
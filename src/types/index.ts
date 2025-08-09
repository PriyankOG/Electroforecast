export interface DataPoint {
  timestamp: Date;
  demand: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  isWeekend: boolean;
  isHoliday: boolean;
  seasonalIndex: number;
}

export interface ForecastPoint {
  timestamp: Date;
  predicted: number;
  actual?: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface ModelMetrics {
  mape: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ModelResult {
  name: string;
  forecast: ForecastPoint[];
  metrics: ModelMetrics;
  features: string[];
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
}
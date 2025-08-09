import { DataPoint } from '../types';

export class DataGenerator {
  static generateHistoricalData(days: number = 365): DataPoint[] {
    const data: DataPoint[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);

    for (let i = 0; i < days * 24; i++) {
      const timestamp = new Date(baseDate);
      timestamp.setHours(timestamp.getHours() + i);
      
      const hour = timestamp.getHours();
      const dayOfYear = this.getDayOfYear(timestamp);
      const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;
      const isHoliday = this.isHoliday(timestamp);
      
      // Base demand with seasonal patterns
      let demand = 1000; // Base load
      
      // Seasonal variation (summer peak due to AC)
      demand += 300 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI/2);
      
      // Weekly pattern
      if (isWeekend) {
        demand *= 0.85; // Lower weekend demand
      }
      
      // Daily pattern with morning and evening peaks
      const hourlyMultiplier = this.getHourlyMultiplier(hour);
      demand *= hourlyMultiplier;
      
      // Holiday effects
      if (isHoliday) {
        demand *= 0.7;
      }
      
      // Weather effects
      const temperature = this.generateTemperature(dayOfYear, hour);
      const humidity = 40 + Math.random() * 40;
      const windSpeed = Math.random() * 20;
      
      // Temperature correlation with demand
      if (temperature > 25) {
        demand += (temperature - 25) * 15; // AC load
      } else if (temperature < 5) {
        demand += (5 - temperature) * 20; // Heating load
      }
      
      // Add noise
      demand += (Math.random() - 0.5) * 100;
      demand = Math.max(demand, 200); // Minimum demand
      
      data.push({
        timestamp,
        demand: Math.round(demand),
        temperature,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        isWeekend,
        isHoliday,
        seasonalIndex: Math.sin((dayOfYear / 365) * 2 * Math.PI)
      });
    }
    
    return data;
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private static getHourlyMultiplier(hour: number): number {
    // Morning peak (7-9 AM) and evening peak (6-9 PM)
    if (hour >= 7 && hour <= 9) {
      return 1.3;
    } else if (hour >= 18 && hour <= 21) {
      return 1.4;
    } else if (hour >= 22 || hour <= 5) {
      return 0.7; // Night time low
    }
    return 1.0;
  }

  private static generateTemperature(dayOfYear: number, hour: number): number {
    // Seasonal temperature variation
    const seasonal = 15 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI/2);
    
    // Daily temperature variation
    const daily = 5 * Math.sin((hour / 24) * 2 * Math.PI - Math.PI/2);
    
    // Random variation
    const random = (Math.random() - 0.5) * 8;
    
    return Math.round((seasonal + daily + random) * 10) / 10;
  }

  private static isHoliday(date: Date): boolean {
    // Simple holiday detection for major holidays
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // New Year's Day
    if (month === 1 && day === 1) return true;
    // Christmas
    if (month === 12 && day === 25) return true;
    // July 4th
    if (month === 7 && day === 4) return true;
    
    return false;
  }
}
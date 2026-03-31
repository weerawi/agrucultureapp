import { WeatherData } from '../types';
import { REGIONS } from '../constants/regions';

const HOURLY_VARS = 'temperature_2m,precipitation,relative_humidity_2m';

/**
 * Fetch real weather data from Open-Meteo API (free, no key needed).
 *
 * Uses **hourly** endpoint so we can reliably get temperature, rainfall
 * AND humidity (humidity is NOT available as a daily aggregate in Open-Meteo).
 *
 * Strategy by date distance:
 *   ≤ 16 days  → Forecast API
 *   past       → Historical Archive API
 *   > 16 days  → Archive API with same date last year as proxy
 */
export const fetchWeatherData = async (
  regionId: string,
  date: Date
): Promise<WeatherData> => {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) throw new Error(`Region not found: ${regionId}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let queryDate: string;
  let baseUrl: string;

  if (diffDays >= 0 && diffDays <= 16) {
    // Within forecast range
    baseUrl = 'https://api.open-meteo.com/v1/forecast';
    queryDate = formatDate(date);
  } else if (diffDays < 0) {
    // Past date — use archive API
    baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
    queryDate = formatDate(date);
  } else {
    // Beyond 16-day forecast — use last year's same date as a proxy
    const proxy = new Date(date);
    proxy.setFullYear(proxy.getFullYear() - 1);
    baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
    queryDate = formatDate(proxy);
  }

  const apiUrl =
    `${baseUrl}?latitude=${region.lat}&longitude=${region.lng}` +
    `&hourly=${HOURLY_VARS}` +
    `&timezone=Asia/Colombo&start_date=${queryDate}&end_date=${queryDate}`;

  console.log(`[Weather] Fetching: ${apiUrl}`);

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const hourly = data.hourly;

  if (!hourly || !hourly.time || hourly.time.length === 0) {
    throw new Error('No weather data available for this date');
  }

  // Aggregate 24 hourly readings into daily values
  const temps: number[] = hourly.temperature_2m ?? [];
  const precips: number[] = hourly.precipitation ?? [];
  const humids: number[] = hourly.relative_humidity_2m ?? [];

  const temperature = temps.length > 0
    ? temps.reduce((a, b) => a + b, 0) / temps.length
    : 28;

  const rainfall = precips.length > 0
    ? precips.reduce((a, b) => a + b, 0)
    : 0;

  const humidity = humids.length > 0
    ? humids.reduce((a, b) => a + b, 0) / humids.length
    : 75;

  const result: WeatherData = {
    temperature: Math.round(temperature * 100) / 100,
    rainfall: Math.round(rainfall * 100) / 100,
    humidity: Math.round(humidity * 100) / 100,
  };

  console.log(`[Weather] ${region.name} (${queryDate}): Temp=${result.temperature}°C, Rain=${result.rainfall}mm, Humidity=${result.humidity}%`);

  return result;
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

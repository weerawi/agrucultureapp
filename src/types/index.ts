export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Commodity {
  id: string;
  name: string;
  nameKey: string;
  icon: string;
  modelFeature: string; // exact column name e.g. "vegitable_Commodity_Potato"
  avgPriceRange: { min: number; max: number };
}

export interface Region {
  id: string;
  name: string;
  nameKey: string;
  lat: number;
  lng: number;
  modelFeature: string; // exact column name e.g. "Region_Colombo"
}

export interface SellingSpot {
  id: string;
  name: string;
  nameKey: string;
  lat: number;
  lng: number;
  type: 'economic_centre' | 'wholesale_market' | 'market';
}

export interface SellingSpotWithDistance extends SellingSpot {
  distanceKm: number;
}

export interface Marketplace {
  id: string;
  name: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface MarketplaceWithDistance extends Marketplace {
  distanceKm: number;
}

export interface Vehicle {
  id: string;
  nameKey: string;
  icon: string;
  baseFee: number;
  perKmRate: number;
  includedKm: number;
  maxCapacityKg: number;
}

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

export type Recommendation = 'SELL' | 'DONT_SELL' | 'MARGINAL';

export interface ForecastInput {
  commodityId: string;
  regionId: string;
  targetDate: Date;
  quantityKg: number;
  harvestingCost: number;
  vehicleId: string;
  sellingSpotId: string;
}

export interface ProfitAnalysis {
  predictedPricePerKg: number;
  estimatedRevenue: number;
  transportCost: number;
  harvestingCost: number;
  netProfit: number;
  profitPercentage: number;
  recommendation: Recommendation;
  distanceKm: number;
  tripsNeeded: number;
}

export interface ForecastResult {
  id?: string;
  input: ForecastInput;
  weather: WeatherData;
  predictedPricePerKg: number;
  profitAnalysis: ProfitAnalysis;
  createdAt: string;
}

export type Language = 'en' | 'si' | 'ta';

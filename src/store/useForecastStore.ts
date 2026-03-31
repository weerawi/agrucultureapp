import { create } from 'zustand';
import { WeatherData, SellingSpotWithDistance, MarketplaceWithDistance, ForecastResult, ProfitAnalysis } from '../types';

interface WizardState {
  // Step tracking
  currentStep: number; // 1-4

  // Step 1: Crop Details
  commodityId: string;
  regionId: string;
  targetDate: Date;
  quantityKg: number;
  harvestingCost: number;

  // Step 2: Weather & Price
  weather: WeatherData | null;
  predictedPricePerKg: number | null;
  isLoadingStep2: boolean;
  step2Error: string | null;

  // Step 3: Market & Transport
  userLocation: { lat: number; lng: number } | null;
  referenceLocation: { lat: number; lng: number } | null;
  nearestSpots: SellingSpotWithDistance[];
  nearestMarketplaces: MarketplaceWithDistance[];
  selectedSpotId: string;
  selectedMarketplaceId: string;
  vehicleId: string;
  isLoadingStep3: boolean;

  // Step 4: Profit result
  profitAnalysis: ProfitAnalysis | null;
  lastResult: ForecastResult | null;

  // Actions — Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;

  // Actions — Step 1
  setCommodityId: (id: string) => void;
  setRegionId: (id: string) => void;
  setTargetDate: (date: Date) => void;
  setQuantityKg: (kg: number) => void;
  setHarvestingCost: (cost: number) => void;

  // Actions — Step 2
  setWeather: (weather: WeatherData) => void;
  setPredictedPrice: (price: number) => void;
  setIsLoadingStep2: (loading: boolean) => void;
  setStep2Error: (error: string | null) => void;

  // Actions — Step 3
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  setReferenceLocation: (loc: { lat: number; lng: number }) => void;
  setNearestSpots: (spots: SellingSpotWithDistance[]) => void;
  setNearestMarketplaces: (mps: MarketplaceWithDistance[]) => void;
  setSelectedSpotId: (id: string) => void;
  setSelectedMarketplaceId: (id: string) => void;
  setVehicleId: (id: string) => void;
  setIsLoadingStep3: (loading: boolean) => void;

  // Actions — Step 4
  setProfitAnalysis: (analysis: ProfitAnalysis) => void;
  setLastResult: (result: ForecastResult) => void;
}

const initialState = {
  currentStep: 1,
  commodityId: '',
  regionId: '',
  targetDate: new Date(),
  quantityKg: 0,
  harvestingCost: 0,
  weather: null,
  predictedPricePerKg: null,
  isLoadingStep2: false,
  step2Error: null,
  userLocation: null,
  referenceLocation: null,
  nearestSpots: [],
  nearestMarketplaces: [],
  selectedSpotId: '',
  selectedMarketplaceId: '',
  vehicleId: '',
  isLoadingStep3: false,
  profitAnalysis: null,
  lastResult: null,
};

export const useForecastStore = create<WizardState>((set) => ({
  ...initialState,

  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 4) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  goToStep: (step) => set({ currentStep: step }),
  reset: () => set({ ...initialState, targetDate: new Date() }),

  setCommodityId: (commodityId) => set({ commodityId }),
  setRegionId: (regionId) => set({ regionId }),
  setTargetDate: (targetDate) => set({ targetDate }),
  setQuantityKg: (quantityKg) => set({ quantityKg }),
  setHarvestingCost: (harvestingCost) => set({ harvestingCost }),

  setWeather: (weather) => set({ weather }),
  setPredictedPrice: (predictedPricePerKg) => set({ predictedPricePerKg }),
  setIsLoadingStep2: (isLoadingStep2) => set({ isLoadingStep2 }),
  setStep2Error: (step2Error) => set({ step2Error }),

  setUserLocation: (userLocation) => set({ userLocation }),
  setReferenceLocation: (referenceLocation) => set({ referenceLocation }),
  setNearestSpots: (nearestSpots) => set({ nearestSpots }),
  setNearestMarketplaces: (nearestMarketplaces) => set({ nearestMarketplaces }),
  setSelectedSpotId: (selectedSpotId) => set({ selectedSpotId }),
  setSelectedMarketplaceId: (selectedMarketplaceId) => set({ selectedMarketplaceId }),
  setVehicleId: (vehicleId) => set({ vehicleId }),
  setIsLoadingStep3: (isLoadingStep3) => set({ isLoadingStep3 }),

  setProfitAnalysis: (profitAnalysis) => set({ profitAnalysis }),
  setLastResult: (lastResult) => set({ lastResult }),
}));

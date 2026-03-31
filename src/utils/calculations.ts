import { Vehicle, ProfitAnalysis, Recommendation } from '../types';

/**
 * Calculate transport cost using tiered pricing:
 * cost = (baseFee + max(0, distance - includedKm) * perKmRate) * trips
 */
export const calculateTransportCost = (
  vehicle: Vehicle,
  distanceKm: number,
  quantityKg: number
): { cost: number; tripsNeeded: number } => {
  const tripsNeeded = Math.ceil(quantityKg / vehicle.maxCapacityKg);
  const extraKm = Math.max(0, distanceKm - vehicle.includedKm);
  const singleTripCost = vehicle.baseFee + extraKm * vehicle.perKmRate;
  return {
    cost: Math.round(singleTripCost * tripsNeeded * 100) / 100,
    tripsNeeded,
  };
};

/**
 * Full profit analysis
 */
export const calculateProfitAnalysis = (
  predictedPricePerKg: number,
  quantityKg: number,
  harvestingCost: number,
  vehicle: Vehicle,
  distanceKm: number
): ProfitAnalysis => {
  const estimatedRevenue = predictedPricePerKg * quantityKg;
  const { cost: transportCost, tripsNeeded } = calculateTransportCost(
    vehicle,
    distanceKm,
    quantityKg
  );
  const netProfit = estimatedRevenue - transportCost - harvestingCost;
  const profitPercentage =
    estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0;

  let recommendation: Recommendation;
  if (profitPercentage >= 10) {
    recommendation = 'SELL';
  } else if (profitPercentage >= 0) {
    recommendation = 'MARGINAL';
  } else {
    recommendation = 'DONT_SELL';
  }

  return {
    predictedPricePerKg,
    estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
    transportCost,
    harvestingCost,
    netProfit: Math.round(netProfit * 100) / 100,
    profitPercentage: Math.round(profitPercentage * 100) / 100,
    recommendation,
    distanceKm: Math.round(distanceKm * 100) / 100,
    tripsNeeded,
  };
};

/**
 * Format currency in Sri Lankan Rupees
 */
export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

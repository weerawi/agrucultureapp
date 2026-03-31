import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase/config';
import { Marketplace, MarketplaceWithDistance } from '../types';
import { haversineDistance } from '../utils/regionMapper';

let cachedMarketplaces: Marketplace[] | null = null;

/**
 * Fetch all active marketplaces from Firestore.
 * Results are cached in memory to avoid redundant reads.
 */
export const fetchMarketplaces = async (): Promise<Marketplace[]> => {
  if (cachedMarketplaces) return cachedMarketplaces;

  const q = query(collection(db, 'marketplaces'), where('status', '==', 'Active'));
  const snapshot = await getDocs(q);

  cachedMarketplaces = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Marketplace, 'id'>),
  }));

  return cachedMarketplaces;
};

/**
 * Find the N nearest marketplaces to the given GPS coordinates.
 * Uses Haversine formula for geodesic distance ranking.
 */
export const findNearestMarketplaces = async (
  lat: number,
  lng: number,
  count: number = 5
): Promise<MarketplaceWithDistance[]> => {
  const marketplaces = await fetchMarketplaces();

  const withDistance: MarketplaceWithDistance[] = marketplaces.map((mp) => ({
    ...mp,
    distanceKm: haversineDistance(lat, lng, mp.latitude, mp.longitude),
  }));

  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDistance.slice(0, count);
};

/**
 * Auto-suggest the most cost-effective vehicle based on harvest weight.
 * Selects the smallest vehicle that can carry the load in a single trip,
 * falling back to the largest available vehicle for heavy loads.
 */
export const suggestVehicleId = (quantityKg: number): string => {
  if (quantityKg <= 300) return 'three_wheeler';
  if (quantityKg <= 1000) return 'mini_truck';
  if (quantityKg <= 3000) return 'lorry_small';
  return 'lorry_large';
};

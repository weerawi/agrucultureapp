import { REGIONS } from '../constants/regions';
import { SELLING_SPOTS } from '../constants/sellingSpots';
import { Region, SellingSpotWithDistance } from '../types';

/**
 * Find the nearest region to the given GPS coordinates.
 */
export const findNearestRegion = (lat: number, lng: number): Region => {
  let nearest = REGIONS[0];
  let minDistance = Infinity;

  for (const region of REGIONS) {
    const distance = haversineDistance(lat, lng, region.lat, region.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = region;
    }
  }

  return nearest;
};

/**
 * Find the N nearest selling spots to the given GPS coordinates.
 */
export const findNearestSellingSpots = (
  lat: number,
  lng: number,
  count: number = 5
): SellingSpotWithDistance[] => {
  const spotsWithDistance = SELLING_SPOTS.map((spot) => ({
    ...spot,
    distanceKm: haversineDistance(lat, lng, spot.lat, spot.lng),
  }));

  spotsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return spotsWithDistance.slice(0, count);
};

/**
 * Calculate distance between two GPS points (km).
 */
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

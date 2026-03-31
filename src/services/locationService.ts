import * as Location from 'expo-location';
import { findNearestRegion } from '../utils/regionMapper';
import { Region } from '../types';

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentRegion = async (): Promise<Region | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    return findNearestRegion(latitude, longitude);
  } catch {
    return null;
  }
};

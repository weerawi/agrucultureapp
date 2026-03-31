import { Vehicle } from '../types';

export const VEHICLES: Vehicle[] = [
  {
    id: 'three_wheeler',
    nameKey: 'vehicles.threeWheeler',
    icon: 'rickshaw',
    baseFee: 120,
    perKmRate: 90,
    includedKm: 1,
    maxCapacityKg: 300,
  },
  {
    id: 'mini_truck',
    nameKey: 'vehicles.miniTruck',
    icon: 'van-utility',
    baseFee: 2000,
    perKmRate: 60,
    includedKm: 5,
    maxCapacityKg: 1000,
  },
  {
    id: 'lorry_small',
    nameKey: 'vehicles.lorrySmall',
    icon: 'truck',
    baseFee: 4000,
    perKmRate: 80,
    includedKm: 10,
    maxCapacityKg: 3000,
  },
  {
    id: 'lorry_large',
    nameKey: 'vehicles.lorryLarge',
    icon: 'truck-delivery',
    baseFee: 7000,
    perKmRate: 100,
    includedKm: 10,
    maxCapacityKg: 8000,
  },
];

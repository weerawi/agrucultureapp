import { Vehicle } from '../types';

export const VEHICLES: Vehicle[] = [
  {
    id: 'three_wheeler',
    nameKey: 'vehicles.threeWheeler',
    icon: 'rickshaw',
    baseFee: 500,
    perKmRate: 25,
    maxCapacityKg: 300,
  },
  {
    id: 'mini_truck',
    nameKey: 'vehicles.miniTruck',
    icon: 'van-utility',
    baseFee: 1500,
    perKmRate: 40,
    maxCapacityKg: 1000,
  },
  {
    id: 'lorry_small',
    nameKey: 'vehicles.lorrySmall',
    icon: 'truck',
    baseFee: 3000,
    perKmRate: 55,
    maxCapacityKg: 3000,
  },
  {
    id: 'lorry_large',
    nameKey: 'vehicles.lorryLarge',
    icon: 'truck-delivery',
    baseFee: 5000,
    perKmRate: 70,
    maxCapacityKg: 8000,
  },
];

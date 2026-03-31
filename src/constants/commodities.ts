import { Commodity } from '../types';

export const COMMODITIES: Commodity[] = [
  { id: 'asiatic_pennywort', name: 'Asiatic Pennywort', nameKey: 'vegetables.asiaticPennywort', icon: '🌿', modelFeature: 'vegitable_Commodity_Asiatic Pennywort', avgPriceRange: { min: 80, max: 200 } },
  { id: 'beetroot', name: 'Beetroot', nameKey: 'vegetables.beetroot', icon: '🫒', modelFeature: 'vegitable_Commodity_Beetroot', avgPriceRange: { min: 100, max: 250 } },
  { id: 'bitter_melon', name: 'Bitter Melon', nameKey: 'vegetables.bitterMelon', icon: '🥒', modelFeature: 'vegitable_Commodity_Bitter Melon', avgPriceRange: { min: 80, max: 200 } },
  { id: 'breadfruit', name: 'Breadfruit', nameKey: 'vegetables.breadfruit', icon: '🍈', modelFeature: 'vegitable_Commodity_Breadfruit', avgPriceRange: { min: 60, max: 150 } },
  { id: 'brinjal', name: 'Brinjal', nameKey: 'vegetables.brinjal', icon: '🍆', modelFeature: 'vegitable_Commodity_Brinjal', avgPriceRange: { min: 60, max: 180 } },
  { id: 'cabbage', name: 'Cabbage', nameKey: 'vegetables.cabbage', icon: '🥬', modelFeature: 'vegitable_Commodity_Cabbage', avgPriceRange: { min: 50, max: 150 } },
  { id: 'carrot', name: 'Carrot', nameKey: 'vegetables.carrot', icon: '🥕', modelFeature: 'vegitable_Commodity_Carrot', avgPriceRange: { min: 120, max: 280 } },
  { id: 'drumsticks', name: 'Drumsticks', nameKey: 'vegetables.drumsticks', icon: '🌱', modelFeature: 'vegitable_Commodity_Drumsticks', avgPriceRange: { min: 100, max: 300 } },
  { id: 'jackfruit', name: 'Jackfruit', nameKey: 'vegetables.jackfruit', icon: '🍊', modelFeature: 'vegitable_Commodity_Jackfruit', avgPriceRange: { min: 40, max: 120 } },
  { id: 'knol_khol', name: 'Knol-Khol', nameKey: 'vegetables.knolKhol', icon: '🥦', modelFeature: 'vegitable_Commodity_Knol-Khol', avgPriceRange: { min: 100, max: 250 } },
  { id: 'leeks', name: 'Leeks', nameKey: 'vegetables.leeks', icon: '🧅', modelFeature: 'vegitable_Commodity_Leeks', avgPriceRange: { min: 150, max: 350 } },
  { id: 'long_purple_eggplant', name: 'Long Purple Eggplant', nameKey: 'vegetables.longPurpleEggplant', icon: '🍆', modelFeature: 'vegitable_Commodity_Long Purple Eggplant', avgPriceRange: { min: 80, max: 200 } },
  { id: 'manioc', name: 'Manioc', nameKey: 'vegetables.manioc', icon: '🥔', modelFeature: 'vegitable_Commodity_Manioc', avgPriceRange: { min: 60, max: 150 } },
  { id: 'onion', name: 'Onion', nameKey: 'vegetables.onion', icon: '🧅', modelFeature: 'vegitable_Commodity_Onion', avgPriceRange: { min: 100, max: 300 } },
  { id: 'pennywort', name: 'Pennywort', nameKey: 'vegetables.pennywort', icon: '🍀', modelFeature: 'vegitable_Commodity_Pennywort', avgPriceRange: { min: 80, max: 200 } },
  { id: 'potato', name: 'Potato', nameKey: 'vegetables.potato', icon: '🥔', modelFeature: 'vegitable_Commodity_Potato', avgPriceRange: { min: 80, max: 200 } },
  { id: 'pumpkin', name: 'Pumpkin', nameKey: 'vegetables.pumpkin', icon: '🎃', modelFeature: 'vegitable_Commodity_Pumpkin', avgPriceRange: { min: 50, max: 130 } },
  { id: 'red_spinach', name: 'Red Spinach', nameKey: 'vegetables.redSpinach', icon: '🥬', modelFeature: 'vegitable_Commodity_Red Spinach', avgPriceRange: { min: 60, max: 180 } },
  { id: 'taro', name: 'Taro', nameKey: 'vegetables.taro', icon: '🥔', modelFeature: 'vegitable_Commodity_Taro', avgPriceRange: { min: 80, max: 200 } },
  { id: 'winged_bean', name: 'Winged Bean', nameKey: 'vegetables.wingedBean', icon: '🫘', modelFeature: 'vegitable_Commodity_Winged Bean', avgPriceRange: { min: 100, max: 250 } },
];

// Model feature names in alphabetical order (must match training data)
export const VEGETABLE_MODEL_FEATURES = COMMODITIES
  .map((c) => c.modelFeature)
  .sort();

import { Commodity } from '../types';

const ICON_CDN = 'https://img.icons8.com/color/96';

export const COMMODITIES: Commodity[] = [
  { id: 'asiatic_pennywort', name: 'Asiatic Pennywort', nameKey: 'vegetables.asiaticPennywort', icon: '🌿', imageUrl: `${ICON_CDN}/basil.png`, modelFeature: 'vegitable_Commodity_Asiatic Pennywort', avgPriceRange: { min: 80, max: 200 } },
  { id: 'beetroot', name: 'Beetroot', nameKey: 'vegetables.beetroot', icon: '🍠', imageUrl: `${ICON_CDN}/beet.png`, modelFeature: 'vegitable_Commodity_Beetroot', avgPriceRange: { min: 100, max: 250 } },
  { id: 'bitter_melon', name: 'Bitter Melon', nameKey: 'vegetables.bitterMelon', icon: '🥒', imageUrl: `${ICON_CDN}/cucumber.png`, modelFeature: 'vegitable_Commodity_Bitter Melon', avgPriceRange: { min: 80, max: 200 } },
  { id: 'breadfruit', name: 'Breadfruit', nameKey: 'vegetables.breadfruit', icon: '🍈', imageUrl: `${ICON_CDN}/melon.png`, modelFeature: 'vegitable_Commodity_Breadfruit', avgPriceRange: { min: 60, max: 150 } },
  { id: 'brinjal', name: 'Brinjal', nameKey: 'vegetables.brinjal', icon: '🍆', imageUrl: `${ICON_CDN}/eggplant.png`, modelFeature: 'vegitable_Commodity_Brinjal', avgPriceRange: { min: 60, max: 180 } },
  { id: 'cabbage', name: 'Cabbage', nameKey: 'vegetables.cabbage', icon: '🥬', imageUrl: `${ICON_CDN}/cabbage.png`, modelFeature: 'vegitable_Commodity_Cabbage', avgPriceRange: { min: 50, max: 150 } },
  { id: 'carrot', name: 'Carrot', nameKey: 'vegetables.carrot', icon: '🥕', imageUrl: `${ICON_CDN}/carrot.png`, modelFeature: 'vegitable_Commodity_Carrot', avgPriceRange: { min: 120, max: 280 } },
  { id: 'drumsticks', name: 'Drumsticks', nameKey: 'vegetables.drumsticks', icon: '🫛', imageUrl: `${ICON_CDN}/asparagus.png`, modelFeature: 'vegitable_Commodity_Drumsticks', avgPriceRange: { min: 100, max: 300 } },
  { id: 'jackfruit', name: 'Jackfruit', nameKey: 'vegetables.jackfruit', icon: '🥭', imageUrl: `${ICON_CDN}/jackfruit.png`, modelFeature: 'vegitable_Commodity_Jackfruit', avgPriceRange: { min: 40, max: 120 } },
  { id: 'knol_khol', name: 'Knol-Khol', nameKey: 'vegetables.knolKhol', icon: '🥦', imageUrl: `${ICON_CDN}/kohlrabi.png`, modelFeature: 'vegitable_Commodity_Knol-Khol', avgPriceRange: { min: 100, max: 250 } },
  { id: 'leeks', name: 'Leeks', nameKey: 'vegetables.leeks', icon: '🥬', imageUrl: `${ICON_CDN}/leek.png`, modelFeature: 'vegitable_Commodity_Leeks', avgPriceRange: { min: 150, max: 350 } },
  { id: 'long_purple_eggplant', name: 'Long Purple Eggplant', nameKey: 'vegetables.longPurpleEggplant', icon: '🍆', imageUrl: `${ICON_CDN}/eggplant.png`, modelFeature: 'vegitable_Commodity_Long Purple Eggplant', avgPriceRange: { min: 80, max: 200 } },
  { id: 'manioc', name: 'Manioc', nameKey: 'vegetables.manioc', icon: '🥔', imageUrl: `${ICON_CDN}/sweet-potato.png`, modelFeature: 'vegitable_Commodity_Manioc', avgPriceRange: { min: 60, max: 150 } },
  { id: 'onion', name: 'Onion', nameKey: 'vegetables.onion', icon: '🧅', imageUrl: `${ICON_CDN}/onion.png`, modelFeature: 'vegitable_Commodity_Onion', avgPriceRange: { min: 100, max: 300 } },
  { id: 'pennywort', name: 'Pennywort', nameKey: 'vegetables.pennywort', icon: '🍀', imageUrl: `${ICON_CDN}/clover.png`, modelFeature: 'vegitable_Commodity_Pennywort', avgPriceRange: { min: 80, max: 200 } },
  { id: 'potato', name: 'Potato', nameKey: 'vegetables.potato', icon: '🥔', imageUrl: `${ICON_CDN}/potato.png`, modelFeature: 'vegitable_Commodity_Potato', avgPriceRange: { min: 80, max: 200 } },
  { id: 'pumpkin', name: 'Pumpkin', nameKey: 'vegetables.pumpkin', icon: '🎃', imageUrl: `${ICON_CDN}/pumpkin.png`, modelFeature: 'vegitable_Commodity_Pumpkin', avgPriceRange: { min: 50, max: 130 } },
  { id: 'red_spinach', name: 'Red Spinach', nameKey: 'vegetables.redSpinach', icon: '🥬', imageUrl: `${ICON_CDN}/spinach.png`, modelFeature: 'vegitable_Commodity_Red Spinach', avgPriceRange: { min: 60, max: 180 } },
  { id: 'taro', name: 'Taro', nameKey: 'vegetables.taro', icon: '🥔', imageUrl: `${ICON_CDN}/ginger.png`, modelFeature: 'vegitable_Commodity_Taro', avgPriceRange: { min: 80, max: 200 } },
  { id: 'winged_bean', name: 'Winged Bean', nameKey: 'vegetables.wingedBean', icon: '🫘', imageUrl: `${ICON_CDN}/peas.png`, modelFeature: 'vegitable_Commodity_Winged Bean', avgPriceRange: { min: 100, max: 250 } },
];

// Model feature names in alphabetical order (must match training data)
export const VEGETABLE_MODEL_FEATURES = COMMODITIES
  .map((c) => c.modelFeature)
  .sort();

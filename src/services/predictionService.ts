import { WeatherData } from '../types';
import { REGIONS } from '../constants/regions';
import { COMMODITIES } from '../constants/commodities';
import appMappings from '../../assets/models/app_mappings.json';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';

/**
 * New model: sl_veg_price_model.tflite
 *
 * Input: 7 features (StandardScaler-normalised)
 *   [0] Region_ID   — index in app_mappings.regions[]
 *   [1] Veg_ID      — index in app_mappings.vegetables[]
 *   [2] Month       — 1-12
 *   [3] Temperature (°C)
 *   [4] Rainfall (mm)
 *   [5] Humidity (%)
 *   [6] Crop Yield Impact Score (0-2)
 *
 * Normalisation:
 *   scaled_value = (raw_value - scaler_mean[i]) / scaler_std[i]
 */

const CROP_YIELD_IMPACT_SCORE = 2; // Range: 0 (low) to 2 (high)

const { regions, vegetables, scaler_mean, scaler_std } = appMappings;

// Singleton model instance – loaded once, reused across predictions.
let modelPromise: Promise<TensorflowModel> | null = null;

const getModel = (): Promise<TensorflowModel> => {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(
      require('../../assets/models/sl_veg_price_model.tflite')
    );
  }
  return modelPromise;
};

/**
 * Map a region constant (by name) to its index in the model's region array.
 */
const getRegionIndex = (regionId: string): number => {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) throw new Error(`Unknown region id: ${regionId}`);
  const idx = regions.indexOf(region.name);
  if (idx === -1) throw new Error(`Region "${region.name}" not found in model mappings`);
  return idx;
};

/**
 * Map a commodity constant (by name) to its index in the model's vegetables array.
 */
const getVegetableIndex = (commodityId: string): number => {
  const commodity = COMMODITIES.find((c) => c.id === commodityId);
  if (!commodity) throw new Error(`Unknown commodity id: ${commodityId}`);
  const idx = vegetables.indexOf(commodity.name);
  if (idx === -1) throw new Error(`Vegetable "${commodity.name}" not found in model mappings`);
  return idx;
};

/**
 * Apply StandardScaler normalisation: (x - mean) / std
 */
const normalise = (raw: number[]): number[] =>
  raw.map((val, i) => (val - scaler_mean[i]) / scaler_std[i]);

/**
 * Build the 7-feature input tensor for the sl_veg_price_model TFLite model.
 */
export const buildModelInput = (
  commodityId: string,
  regionId: string,
  targetDate: Date,
  weather: WeatherData
): number[] => {
  const regionIdx = getRegionIndex(regionId);
  const vegIdx = getVegetableIndex(commodityId);
  const month = targetDate.getMonth() + 1;

  const raw: number[] = [
    regionIdx,
    vegIdx,
    month,
    weather.temperature,
    weather.rainfall,
    weather.humidity,
    CROP_YIELD_IMPACT_SCORE,
  ];

  console.log(`Model raw input: Region=${regions[regionIdx]}(${regionIdx}), Veg=${vegetables[vegIdx]}(${vegIdx}), Month=${month}, Temp=${weather.temperature}, Rain=${weather.rainfall}, Humid=${weather.humidity}, Yield=${CROP_YIELD_IMPACT_SCORE}`);
  return normalise(raw);
};

/**
 * Run model inference using react-native-fast-tflite.
 * Requires a development build (not Expo Go) for the native TFLite runtime.
 */
export const predictPrice = async (
  commodityId: string,
  regionId: string,
  targetDate: Date,
  weather: WeatherData
): Promise<number> => {
  const inputTensor = buildModelInput(commodityId, regionId, targetDate, weather);
  console.log('Model input tensor (7 features, normalised):', inputTensor);

  const model = await getModel();

  // Build a Float32Array from the normalised input
  const inputBuffer = new Float32Array(inputTensor);

  // Run inference — returns an array of ArrayBuffer outputs
  const outputs = model.runSync([inputBuffer]);

  // The model has a single output neuron → extract the predicted price
  const outputArray = new Float32Array(outputs[0].buffer, outputs[0].byteOffset, outputs[0].byteLength / 4);
  const predictedPrice = outputArray[0];

  console.log('TFLite model predicted price:', predictedPrice);
  return Math.round(predictedPrice * 100) / 100;
};

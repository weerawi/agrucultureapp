import { Region } from '../types';

export const REGIONS: Region[] = [
  { id: 'ampara', name: 'Ampara', nameKey: 'regions.ampara', lat: 7.2976, lng: 81.6720, modelFeature: 'Region_Ampara' },
  { id: 'anuradhapura', name: 'Anuradhapura', nameKey: 'regions.anuradhapura', lat: 8.3114, lng: 80.4037, modelFeature: 'Region_Anuradhapura' },
  { id: 'badulla', name: 'Badulla', nameKey: 'regions.badulla', lat: 6.9934, lng: 81.0550, modelFeature: 'Region_Badulla' },
  { id: 'batticaloa', name: 'Batticaloa', nameKey: 'regions.batticaloa', lat: 7.7310, lng: 81.6747, modelFeature: 'Region_Batticaloa' },
  { id: 'colombo', name: 'Colombo', nameKey: 'regions.colombo', lat: 6.9271, lng: 79.8612, modelFeature: 'Region_Colombo' },
  { id: 'galle', name: 'Galle', nameKey: 'regions.galle', lat: 6.0535, lng: 80.2210, modelFeature: 'Region_Galle' },
  { id: 'gampaha', name: 'Gampaha', nameKey: 'regions.gampaha', lat: 7.0840, lng: 80.0098, modelFeature: 'Region_Gampaha' },
  { id: 'hambantota', name: 'Hambantota', nameKey: 'regions.hambantota', lat: 6.1241, lng: 81.1185, modelFeature: 'Region_Hambantota' },
  { id: 'jaffna', name: 'Jaffna', nameKey: 'regions.jaffna', lat: 9.6615, lng: 80.0255, modelFeature: 'Region_Jaffna' },
  { id: 'kalutara', name: 'Kalutara', nameKey: 'regions.kalutara', lat: 6.5854, lng: 79.9607, modelFeature: 'Region_Kalutara' },
  { id: 'kandy', name: 'Kandy', nameKey: 'regions.kandy', lat: 7.2906, lng: 80.6337, modelFeature: 'Region_Kandy' },
  { id: 'kegalle', name: 'Kegalle', nameKey: 'regions.kegalle', lat: 7.2513, lng: 80.3464, modelFeature: 'Region_Kegalle' },
  { id: 'kilinochchi', name: 'Kilinochchi', nameKey: 'regions.kilinochchi', lat: 9.3803, lng: 80.3770, modelFeature: 'Region_Kilinochchi' },
  { id: 'kurunegala', name: 'Kurunegala', nameKey: 'regions.kurunegala', lat: 7.4867, lng: 80.3647, modelFeature: 'Region_Kurunegala' },
  { id: 'mannar', name: 'Mannar', nameKey: 'regions.mannar', lat: 8.9810, lng: 79.9044, modelFeature: 'Region_Mannar' },
  { id: 'matale', name: 'Matale', nameKey: 'regions.matale', lat: 7.4675, lng: 80.6234, modelFeature: 'Region_Matale' },
  { id: 'matara', name: 'Matara', nameKey: 'regions.matara', lat: 5.9549, lng: 80.5550, modelFeature: 'Region_Matara' },
  { id: 'monaragala', name: 'Monaragala', nameKey: 'regions.monaragala', lat: 6.8728, lng: 81.3507, modelFeature: 'Region_Monaragala' },
  { id: 'mullaitivu', name: 'Mullaitivu', nameKey: 'regions.mullaitivu', lat: 9.2671, lng: 80.8142, modelFeature: 'Region_Mullaitivu' },
  { id: 'nuwara_eliya', name: 'Nuwara Eliya', nameKey: 'regions.nuwaraEliya', lat: 6.9497, lng: 80.7891, modelFeature: 'Region_Nuwara Eliya' },
  { id: 'polonnaruwa', name: 'Polonnaruwa', nameKey: 'regions.polonnaruwa', lat: 7.9403, lng: 81.0188, modelFeature: 'Region_Polonnaruwa' },
  { id: 'puttalam', name: 'Puttalam', nameKey: 'regions.puttalam', lat: 8.0362, lng: 79.8283, modelFeature: 'Region_Puttalam' },
  { id: 'ratnapura', name: 'Ratnapura', nameKey: 'regions.ratnapura', lat: 6.6828, lng: 80.4064, modelFeature: 'Region_Ratnapura' },
  { id: 'trincomalee', name: 'Trincomalee', nameKey: 'regions.trincomalee', lat: 8.5874, lng: 81.2152, modelFeature: 'Region_Trincomalee' },
  { id: 'vavuniya', name: 'Vavuniya', nameKey: 'regions.vavuniya', lat: 8.7514, lng: 80.4971, modelFeature: 'Region_Vavuniya' },
];

// Model feature names in alphabetical order (must match training data)
export const REGION_MODEL_FEATURES = REGIONS
  .map((r) => r.modelFeature)
  .sort();

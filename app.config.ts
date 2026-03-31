import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AgriPrice DSS',
  slug: 'agrucultureapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/agriprice_logo-removebg.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/agriprice_logo-removebg.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/agriprice_logo-removebg.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.vinod11.agrucultureapp',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    '@react-native-community/datetimepicker',
    'react-native-fast-tflite',
  ],
});

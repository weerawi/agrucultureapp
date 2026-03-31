import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { AppButton } from '../components/common/AppButton';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { WeatherData } from '../types';
import { fetchWeatherData } from '../services/weatherService';
import { getCurrentRegion } from '../services/locationService';
import { REGIONS } from '../constants/regions';

const DashboardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { detectedRegionId, setDetectedRegionId } = useSettingsStore();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [regionName, setRegionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      // Detect current location
      let rId = detectedRegionId;
      if (!rId) {
        const region = await getCurrentRegion();
        if (region) {
          rId = region.id;
          setDetectedRegionId(region.id);
        } else {
          rId = 'colombo'; // fallback
        }
      }

      const region = REGIONS.find((r) => r.id === rId);
      setRegionName(region ? t(`regions.${region.id}`) : t('regions.colombo'));

      // Fetch today's weather
      const weatherData = await fetchWeatherData(rId!, new Date());
      setWeather(weatherData);
    } catch {
      // Use fallback values on error
      setRegionName(t('regions.colombo'));
      setWeather({ temperature: 28, rainfall: 0, humidity: 75 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [detectedRegionId, t]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const getSeason = (): string => {
    const month = new Date().getMonth();
    // Sri Lanka seasons: Yala (May-Sep), Maha (Oct-Mar)
    if (month >= 4 && month <= 8) return t('dashboard.yalaSeason');
    return t('dashboard.mahaSeason');
  };

  const getSeasonalTips = (): string[] => {
    const month = new Date().getMonth();
    if (month >= 4 && month <= 8) {
      return [
        t('dashboard.tip1Yala'),
        t('dashboard.tip2Yala'),
        t('dashboard.tip3Yala'),
      ];
    }
    return [
      t('dashboard.tip1Maha'),
      t('dashboard.tip2Maha'),
      t('dashboard.tip3Maha'),
    ];
  };

  const getWeatherAdvice = (): string => {
    if (!weather) return '';
    if (weather.temperature > 32) return t('dashboard.weatherHot');
    if (weather.rainfall > 10) return t('dashboard.weatherRainy');
    if (weather.humidity > 85) return t('dashboard.weatherHumid');
    return t('dashboard.weatherFavorable');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || t('settings.farmer');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-sharp" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.cardTitle}>{t('dashboard.currentLocation')}</Text>
          </View>
          <Text style={styles.locationName}>
            {regionName || t('common.loading')}
          </Text>
          <Text style={styles.seasonBadge}>{getSeason()}</Text>
        </View>

        {/* Weather Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.cardTitle}>{t('dashboard.currentWeather')}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
          ) : weather ? (
            <>
              <View style={styles.weatherGrid}>
                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons name="thermometer" size={24} color={Colors.error} />
                  <Text style={styles.weatherValue}>{weather.temperature}°C</Text>
                  <Text style={styles.weatherLabel}>{t('wizard.temperature')}</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Ionicons name="water" size={24} color={Colors.info} />
                  <Text style={styles.weatherValue}>{weather.humidity}%</Text>
                  <Text style={styles.weatherLabel}>{t('wizard.humidity')}</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Ionicons name="rainy" size={24} color={Colors.info} />
                  <Text style={styles.weatherValue}>{weather.rainfall} mm</Text>
                  <Text style={styles.weatherLabel}>{t('wizard.rainfall')}</Text>
                </View>
              </View>
              <View style={styles.adviceBanner}>
                <Text style={styles.adviceText}>{getWeatherAdvice()}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Seasonal Tips Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="leaf" size={20} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.cardTitle}>{t('dashboard.seasonalTips')}</Text>
          </View>
          {getSeasonalTips().map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{t('dashboard.disclaimer')}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
    paddingTop: Spacing.md,
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    ...Typography.h2,
    color: Colors.primaryDark,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  locationName: {
    ...Typography.h3,
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  seasonBadge: {
    ...Typography.captionBold,
    color: Colors.primary,
    backgroundColor: '#F0F7E8',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  weatherItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  weatherValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  weatherLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  adviceBanner: {
    backgroundColor: '#F0F7E8',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  adviceText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingRight: Spacing.md,
  },
  tipBullet: {
    ...Typography.body,
    color: Colors.primary,
    marginRight: Spacing.sm,
    fontWeight: '700',
  },
  tipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  disclaimer: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});

export default DashboardScreen;

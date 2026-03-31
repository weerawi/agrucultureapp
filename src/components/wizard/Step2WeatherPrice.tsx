import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useForecastStore } from '../../store/useForecastStore';
import { fetchWeatherData } from '../../services/weatherService';
import { predictPrice } from '../../services/predictionService';
import { formatCurrency } from '../../utils/calculations';

const Step2WeatherPrice = () => {
  const { t } = useTranslation();
  const {
    commodityId,
    regionId,
    targetDate,
    quantityKg,
    weather,
    predictedPricePerKg,
    isLoadingStep2,
    step2Error,
    setWeather,
    setPredictedPrice,
    setIsLoadingStep2,
    setStep2Error,
  } = useForecastStore();

  useEffect(() => {
    const loadWeatherAndPredict = async () => {
      if (!commodityId || !regionId) return;
      setIsLoadingStep2(true);
      setStep2Error(null);

      try {
        const weatherData = await fetchWeatherData(regionId, targetDate);
        setWeather(weatherData);

        const price = await predictPrice(commodityId, regionId, targetDate, weatherData);
        setPredictedPrice(price);
      } catch (err: any) {
        setStep2Error(err?.message || 'Failed to fetch data');
      } finally {
        setIsLoadingStep2(false);
      }
    };

    loadWeatherAndPredict();
  }, [commodityId, regionId, targetDate]);

  if (isLoadingStep2) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('wizard.fetchingWeather')}</Text>
      </View>
    );
  }

  if (step2Error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}><Ionicons name="warning" size={40} color={Colors.warning} /></Text>
        <Text style={styles.errorText}>{step2Error}</Text>
      </View>
    );
  }

  const estimatedRevenue = predictedPricePerKg && quantityKg > 0
    ? predictedPricePerKg * quantityKg
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('wizard.step2Title')}</Text>
      <Text style={styles.subheading}>{t('wizard.step2Desc')}</Text>

      {/* Weather Card */}
      {weather && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="partly-sunny" size={18} color={Colors.primary} /> {t('wizard.weatherData')}</Text>
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <MaterialCommunityIcons name="thermometer" size={24} color={Colors.error} />
              <Text style={styles.weatherValue}>{weather.temperature}°C</Text>
              <Text style={styles.weatherLabel}>{t('wizard.temperature')}</Text>
            </View>
            <View style={styles.weatherItem}>
              <Ionicons name="rainy" size={24} color={Colors.info} />
              <Text style={styles.weatherValue}>{weather.rainfall} mm</Text>
              <Text style={styles.weatherLabel}>{t('wizard.rainfall')}</Text>
            </View>
            <View style={styles.weatherItem}>
              <Ionicons name="water" size={24} color={Colors.info} />
              <Text style={styles.weatherValue}>{weather.humidity}%</Text>
              <Text style={styles.weatherLabel}>{t('wizard.humidity')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Predicted Price Card */}
      {predictedPricePerKg !== null && (
        <View style={[styles.card, styles.priceCard]}>
          <Text style={styles.cardTitle}><Ionicons name="analytics" size={18} color={Colors.primary} /> {t('wizard.predictedPrice')}</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(predictedPricePerKg)}
            <Text style={styles.priceUnit}> /kg</Text>
          </Text>

          {quantityKg > 0 && (
            <View style={styles.revenueRow}>
              <Text style={styles.revenueLabel}>{t('wizard.estimatedRevenue')}</Text>
              <Text style={styles.revenueValue}>
                {formatCurrency(estimatedRevenue)}
              </Text>
              <Text style={styles.revenueCalc}>
                ({formatCurrency(predictedPricePerKg)}/kg × {quantityKg} kg)
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          <Ionicons name="information-circle" size={14} color={Colors.info} /> {t('wizard.weatherNote')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
  },
  heading: {
    ...Typography.h3,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  priceCard: {
    borderColor: Colors.primaryMuted,
    borderWidth: 2,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  weatherValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  weatherLabel: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  revenueRow: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  revenueLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  revenueValue: {
    ...Typography.h3,
    color: Colors.primaryDark,
  },
  revenueCalc: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoText: {
    ...Typography.small,
    color: Colors.info,
  },
});

export default Step2WeatherPrice;

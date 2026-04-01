import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { AppButton } from '../common/AppButton';
import { useForecastStore } from '../../store/useForecastStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COMMODITIES } from '../../constants/commodities';
import { REGIONS } from '../../constants/regions';
import { VEHICLES } from '../../constants/vehicles';
import { calculateProfitAnalysis, formatCurrency } from '../../utils/calculations';
import { saveForecast } from '../../services/firebase/firestoreService';
import { ForecastResult, ProfitAnalysis } from '../../types';

const Step4ProfitAnalysis = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    commodityId,
    regionId,
    targetDate,
    quantityKg,
    harvestingCost,
    vehicleId,
    selectedMarketplaceId,
    weather,
    predictedPricePerKg,
    nearestMarketplaces,
    profitAnalysis,
    setProfitAnalysis,
    setLastResult,
    reset,
  } = useForecastStore();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!predictedPricePerKg || !vehicleId || !selectedMarketplaceId) return;

    const vehicle = VEHICLES.find((v) => v.id === vehicleId);
    const spot = nearestMarketplaces.find((m) => m.id === selectedMarketplaceId);
    if (!vehicle || !spot) return;

    const analysis = calculateProfitAnalysis(
      predictedPricePerKg,
      quantityKg,
      harvestingCost,
      vehicle,
      spot.distanceKm,
    );
    setProfitAnalysis(analysis);
  }, [predictedPricePerKg, vehicleId, selectedMarketplaceId, quantityKg, harvestingCost]);

  const handleSave = async () => {
    if (!user || !profitAnalysis || !weather || !predictedPricePerKg) return;
    setSaving(true);
    try {
      const commodity = COMMODITIES.find((c) => c.id === commodityId);
      const result: ForecastResult = {
        input: {
          commodityId,
          regionId,
          targetDate,
          quantityKg,
          harvestingCost,
          vehicleId,
          sellingSpotId: selectedMarketplaceId,
        },
        weather,
        predictedPricePerKg,
        profitAnalysis,
        commodityImageUrl: commodity?.imageUrl,
        createdAt: new Date().toISOString(),
      };
      await saveForecast(user.uid, result);
      setLastResult(result);
      setSaved(true);
      // Auto-reset wizard back to step 1 after a brief delay
      setTimeout(() => {
        reset();
      }, 1200);
    } catch {
      Alert.alert(t('common.error'), 'Failed to save forecast');
    }
    setSaving(false);
  };

  if (!profitAnalysis) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('wizard.missingData')}</Text>
      </View>
    );
  }

  const commodity = COMMODITIES.find((c) => c.id === commodityId);
  const region = REGIONS.find((r) => r.id === regionId);
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  const spot = nearestMarketplaces.find((m) => m.id === selectedMarketplaceId);

  const isProfit = profitAnalysis.netProfit >= 0;
  const badgeColor =
    profitAnalysis.recommendation === 'SELL'
      ? Colors.success
      : profitAnalysis.recommendation === 'MARGINAL'
      ? Colors.warning
      : Colors.error;
  const badgeBg =
    profitAnalysis.recommendation === 'SELL'
      ? Colors.successLight
      : profitAnalysis.recommendation === 'MARGINAL'
      ? Colors.warningLight
      : Colors.errorLight;
  const badgeLabel =
    profitAnalysis.recommendation === 'SELL'
      ? t('wizard.sellNow')
      : profitAnalysis.recommendation === 'MARGINAL'
      ? t('wizard.marginal')
      : t('wizard.dontSell');

  return (
    <View style={styles.container}>
      {/* Recommendation Badge */}
      <View style={[styles.recommendBanner, { backgroundColor: badgeBg }]}>
        <Text style={[styles.recommendText, { color: badgeColor }]}>
          {badgeLabel}
        </Text>
        <Text style={[styles.recommendSub, { color: badgeColor }]}>
          {profitAnalysis.profitPercentage >= 0 ? '+' : ''}
          {profitAnalysis.profitPercentage.toFixed(1)}% {t('wizard.profitMargin')}
        </Text>
      </View>

      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {commodity?.imageUrl ? (
            <Image source={{ uri: commodity.imageUrl }} style={{ width: 24, height: 24 }} />
          ) : null}
          <Text style={styles.commodityText}>
            {commodity ? t(commodity.nameKey) : ''} — {region ? t(region.nameKey) : ''}
          </Text>
        </View>
      </View>

      {/* Breakdown Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}><Ionicons name="cash" size={18} color={Colors.primaryDark} /> {t('wizard.profitBreakdown')}</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('wizard.pricePerKg')}</Text>
          <Text style={styles.rowValue}>{formatCurrency(profitAnalysis.predictedPricePerKg)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('wizard.quantity')}</Text>
          <Text style={styles.rowValue}>{quantityKg} kg</Text>
        </View>

        <View style={[styles.row, styles.revenueRow]}>
          <Text style={styles.rowLabelBold}>{t('wizard.estimatedRevenue')}</Text>
          <Text style={styles.revenueValue}>{formatCurrency(profitAnalysis.estimatedRevenue)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.deductLabel}>(-) {t('wizard.transportCostLabel')}</Text>
          <Text style={styles.deductValue}>{formatCurrency(profitAnalysis.transportCost)}</Text>
        </View>

        {profitAnalysis.tripsNeeded > 1 && (
          <Text style={styles.tripNote}>
            ({profitAnalysis.tripsNeeded} {t('wizard.trips')} × {spot ? `${spot.distanceKm.toFixed(1)} km` : ''})
          </Text>
        )}

        <View style={styles.row}>
          <Text style={styles.deductLabel}>(-) {t('wizard.harvestingCostLabel')}</Text>
          <Text style={styles.deductValue}>{formatCurrency(profitAnalysis.harvestingCost)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t('wizard.netProfit')}</Text>
          <Text style={[styles.totalValue, { color: isProfit ? Colors.success : Colors.error }]}>
            {isProfit ? '+' : ''}{formatCurrency(profitAnalysis.netProfit)}
          </Text>
        </View>
      </View>

      {/* Transport Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('wizard.vehicle')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {vehicle && <MaterialCommunityIcons name={vehicle.icon as any} size={18} color={Colors.primaryDark} />}
            <Text style={styles.detailValue}>{vehicle ? t(vehicle.nameKey) : ''}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('wizard.market')}</Text>
          <Text style={styles.detailValue}>{spot?.name ?? ''}</Text>
        </View>
      </View>

      {/* Save Button */}
      <AppButton
        title={saved ? t('wizard.saved') : t('wizard.saveToHistory')}
        onPress={handleSave}
        loading={saving}
        disabled={saved}
        variant={saved ? 'secondary' : 'primary'}
        icon={saved ? <Ionicons name="checkmark" size={18} color={Colors.textSecondary} /> : undefined}
      />

      <Text style={styles.disclaimer}>{t('wizard.disclaimer')}</Text>
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
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
  },
  recommendBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  recommendText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  recommendSub: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryHeader: {
    marginBottom: Spacing.md,
  },
  commodityText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
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
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rowValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  rowLabelBold: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  revenueRow: {
    paddingTop: Spacing.xs,
  },
  revenueValue: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  deductLabel: {
    ...Typography.caption,
    color: Colors.error,
  },
  deductValue: {
    ...Typography.captionBold,
    color: Colors.error,
  },
  tripNote: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: -6,
    marginBottom: Spacing.sm,
  },
  totalRow: {
    paddingTop: Spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.h3,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
  },
  detailLabel: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  detailValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  disclaimer: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default Step4ProfitAnalysis;

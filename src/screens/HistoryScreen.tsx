import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { ForecastResult } from '../types';
import { COMMODITIES } from '../constants/commodities';
import { REGIONS } from '../constants/regions';
import { useAuthStore } from '../store/useAuthStore';
import {
  getForecastHistory,
  deleteForecast,
} from '../services/firebase/firestoreService';
import { formatCurrency } from '../utils/calculations';

const recommendationColors: Record<string, string> = {
  SELL: Colors.sellBadge,
  MARGINAL: Colors.holdBadge,
  DONT_SELL: Colors.error,
};

const HistoryScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getForecastHistory(user.uid);
      setForecasts(data);
    } catch {
      // Silently handle — list will remain empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDelete = (forecastId: string) => {
    Alert.alert(t('history.deleteTitle'), t('history.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await deleteForecast(user.uid, forecastId);
            setForecasts((prev) =>
              prev.filter((f) => f.id !== forecastId)
            );
          } catch {
            Alert.alert(t('common.error'), 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ForecastResult }) => {
    const commodity = COMMODITIES.find(
      (c) => c.id === item.input.commodityId
    );
    const region = REGIONS.find((r) => r.id === item.input.regionId);
    const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.commodityIcon}>
              {commodity?.icon || '🌱'}
            </Text>
            <View>
              <Text style={styles.commodityName}>
                {commodity ? t(commodity.nameKey) : 'Unknown'}
              </Text>
              <Text style={styles.regionText}>
                <Ionicons name="location-sharp" size={14} color={Colors.textSecondary} /> {region ? t(region.nameKey) : 'Unknown'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.recommendBadge,
              {
                backgroundColor:
                  (recommendationColors[item.profitAnalysis?.recommendation || ''] || Colors.textTertiary) + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.recommendText,
                {
                  color:
                    recommendationColors[item.profitAnalysis?.recommendation || ''] ||
                    Colors.textTertiary,
                },
              ]}
            >
              {item.profitAnalysis?.recommendation || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('results.predictedPrice')}</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(item.predictedPricePerKg)}/kg
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('wizard.netProfit')}</Text>
            <Text style={[styles.detailValue, styles.earningsValue]}>
              {formatCurrency(item.profitAnalysis?.netProfit ?? 0)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('wizard.profitMargin')}</Text>
            <Text style={styles.detailValue}>
              {(item.profitAnalysis?.profitPercentage ?? 0).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{date}</Text>
          <TouchableOpacity
            onPress={() => item.id && handleDelete(item.id)}
          >
            <Text style={styles.deleteText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('history.title')}</Text>
        <Text style={styles.subtitle}>
          {forecasts.length} {t('history.records')}
        </Text>
      </View>

      {forecasts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="clipboard-outline" size={48} color={Colors.textTertiary} style={{ marginBottom: Spacing.lg }} />
          <Text style={styles.emptyTitle}>{t('history.empty')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('history.emptySubtitle')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={forecasts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.createdAt}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.primaryDark,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  commodityIcon: {
    fontSize: 28,
  },
  commodityName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  regionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recommendBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  recommendText: {
    ...Typography.small,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  detailItem: {
    alignItems: 'center',
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
  earningsValue: {
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateText: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  deleteText: {
    ...Typography.small,
    color: Colors.error,
    fontWeight: '600',
  },
});

export default HistoryScreen;

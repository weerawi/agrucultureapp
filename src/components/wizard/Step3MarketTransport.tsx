import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useForecastStore } from '../../store/useForecastStore';
import { VEHICLES } from '../../constants/vehicles';
import { MarketplaceWithDistance } from '../../types';
import { findNearestMarketplaces, suggestVehicleId } from '../../services/marketplaceService';
import { calculateTransportCost, formatCurrency } from '../../utils/calculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 220;

const Step3MarketTransport = () => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

  const {
    quantityKg,
    userLocation,
    nearestMarketplaces,
    selectedMarketplaceId,
    vehicleId,
    isLoadingStep3,
    setUserLocation,
    setNearestMarketplaces,
    setSelectedMarketplaceId,
    setVehicleId,
    setIsLoadingStep3,
  } = useForecastStore();

  useEffect(() => {
    const loadMarketplaces = async () => {
      if (nearestMarketplaces.length > 0) return;
      setIsLoadingStep3(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          setUserLocation(coords);

          const mps = await findNearestMarketplaces(coords.lat, coords.lng, 5);
          setNearestMarketplaces(mps);

          if (mps.length > 0 && !selectedMarketplaceId) {
            setSelectedMarketplaceId(mps[0].id);
          }

          // Auto-suggest vehicle based on harvest weight
          if (!vehicleId) {
            setVehicleId(suggestVehicleId(quantityKg));
          }
        }
      } catch {}
      setIsLoadingStep3(false);
    };
    loadMarketplaces();
  }, []);

  const selectedMp = nearestMarketplaces.find((m) => m.id === selectedMarketplaceId);
  const selectedVehicle = VEHICLES.find((v) => v.id === vehicleId);
  const transportInfo =
    selectedVehicle && selectedMp
      ? calculateTransportCost(selectedVehicle, selectedMp.distanceKm, quantityKg)
      : null;

  const handleMarkerPress = (mp: MarketplaceWithDistance) => {
    setSelectedMarketplaceId(mp.id);
  };

  const suggestedId = suggestVehicleId(quantityKg);

  if (isLoadingStep3) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('wizard.findingMarkets')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('wizard.step3Title')}</Text>
      <Text style={styles.subheading}>{t('wizard.step3Desc')}</Text>

      {/* Map View */}
      {userLocation && nearestMarketplaces.length > 0 ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 0.8,
              longitudeDelta: 0.8,
            }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {nearestMarketplaces.map((mp) => {
              const isSelected = mp.id === selectedMarketplaceId;
              return (
                <Marker
                  key={mp.id}
                  coordinate={{ latitude: mp.latitude, longitude: mp.longitude }}
                  pinColor={isSelected ? Colors.primary : Colors.error}
                  onPress={() => handleMarkerPress(mp)}
                >
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{mp.name}</Text>
                      <Text style={styles.calloutSub}>
                        {mp.district} • {mp.distanceKm.toFixed(1)} km
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('wizard.noSpotsFound')}</Text>
        </View>
      )}

      {/* Marketplace List (compact, below map) */}
      <Text style={styles.sectionLabel}>{t('wizard.nearestSpots')}</Text>
      {nearestMarketplaces.map((mp) => {
        const isSelected = mp.id === selectedMarketplaceId;
        return (
          <TouchableOpacity
            key={mp.id}
            style={[styles.spotCard, isSelected && styles.spotCardActive]}
            onPress={() => setSelectedMarketplaceId(mp.id)}
            activeOpacity={0.7}
          >
            <View style={styles.spotLeft}>
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.spotInfo}>
                <Text style={[styles.spotName, isSelected && styles.spotNameActive]}>
                  {mp.name}
                </Text>
                <Text style={styles.spotType}>
                  📍 {mp.district}, {mp.province}
                </Text>
              </View>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {mp.distanceKm.toFixed(1)} km
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Vehicle Dropdown */}
      <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
        {t('wizard.selectVehicle')}
      </Text>

      {/* Dropdown trigger */}
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownLeft}>
          {selectedVehicle ? (
            <>
              <Text style={styles.vehicleIcon}>{selectedVehicle.icon}</Text>
              <View>
                <Text style={styles.dropdownTriggerText}>
                  {t(selectedVehicle.nameKey)}
                </Text>
                <Text style={styles.vehicleCapacity}>
                  Max: {selectedVehicle.maxCapacityKg} kg
                  {selectedVehicle.id === suggestedId && (
                    <Text style={styles.suggestedBadgeInline}> ★ {t('wizard.recommended')}</Text>
                  )}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.dropdownPlaceholder}>{t('wizard.selectVehicle')}</Text>
          )}
        </View>
        <Text style={styles.dropdownArrow}>{vehicleDropdownOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown options */}
      {vehicleDropdownOpen && (
        <View style={styles.dropdownOptions}>
          {VEHICLES.map((vehicle) => {
            const isSelected = vehicle.id === vehicleId;
            const isSuggested = vehicle.id === suggestedId;
            const info = selectedMp
              ? calculateTransportCost(vehicle, selectedMp.distanceKm, quantityKg)
              : null;
            const overCapacity = quantityKg > vehicle.maxCapacityKg;

            return (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                onPress={() => {
                  setVehicleId(vehicle.id);
                  setVehicleDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownItemLeft}>
                  <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                  <View>
                    <View style={styles.vehicleNameRow}>
                      <Text style={[styles.vehicleName, isSelected && styles.spotNameActive]}>
                        {t(vehicle.nameKey)}
                      </Text>
                      {isSuggested && (
                        <View style={styles.suggestedBadge}>
                          <Text style={styles.suggestedBadgeText}>★ {t('wizard.recommended')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.vehicleCapacity}>
                      Max: {vehicle.maxCapacityKg} kg
                    </Text>
                  </View>
                </View>
                <View style={styles.dropdownItemRight}>
                  {info && (
                    <Text style={styles.vehicleCost}>{formatCurrency(info.cost)}</Text>
                  )}
                  {overCapacity && info && (
                    <Text style={styles.tripsText}>
                      {info.tripsNeeded} {t('wizard.trips')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Transport Summary */}
      {transportInfo && selectedMp && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📦 {t('wizard.transportSummary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('wizard.distance')}</Text>
            <Text style={styles.summaryValue}>{selectedMp.distanceKm.toFixed(1)} km</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('wizard.tripsNeeded')}</Text>
            <Text style={styles.summaryValue}>{transportInfo.tripsNeeded}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryTotalLabel}>{t('wizard.totalTransport')}</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(transportInfo.cost)}</Text>
          </View>
        </View>
      )}
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
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // Map
  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  calloutContainer: {
    padding: Spacing.xs,
    maxWidth: 200,
  },
  calloutTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  calloutSub: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Section
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  // Spot cards (compact)
  emptyBox: {
    padding: Spacing.lg,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.warning,
    textAlign: 'center',
  },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  spotCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#F0F7EC',
  },
  spotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  spotNameActive: {
    color: Colors.primaryDark,
  },
  spotType: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: Colors.primaryMuted + '40',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  distanceText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
    fontSize: 11,
  },

  // Vehicle dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownTriggerText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  dropdownPlaceholder: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  dropdownOptions: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: '#F0F7EC',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemRight: {
    alignItems: 'flex-end',
  },
  vehicleIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vehicleName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  vehicleCapacity: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  vehicleCost: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
  },
  tripsText: {
    ...Typography.small,
    color: Colors.warning,
    fontWeight: '600',
  },
  suggestedBadge: {
    backgroundColor: Colors.accentGoldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  suggestedBadgeText: {
    ...Typography.small,
    color: Colors.accentGold,
    fontWeight: '700',
    fontSize: 10,
  },
  suggestedBadgeInline: {
    ...Typography.small,
    color: Colors.accentGold,
    fontWeight: '700',
    fontSize: 10,
  },

  // Transport summary
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  summaryTotalValue: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});

export default Step3MarketTransport;

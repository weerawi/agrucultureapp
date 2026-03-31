import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useForecastStore } from '../../store/useForecastStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { VEHICLES } from '../../constants/vehicles';
import { REGIONS } from '../../constants/regions';
import { MarketplaceWithDistance } from '../../types';
import { findNearestMarketplaces, fetchMarketplaces, suggestVehicleId } from '../../services/marketplaceService';
import { calculateTransportCost, formatCurrency } from '../../utils/calculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 220;

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const Step3MarketTransport = () => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string; description: string; lat: number; lng: number; type: 'place' | 'marketplace' }>>([]);
  const [searchedPlace, setSearchedPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { detectedRegionId } = useSettingsStore();

  const {
    quantityKg,
    regionId,
    userLocation,
    referenceLocation,
    nearestMarketplaces,
    selectedMarketplaceId,
    vehicleId,
    isLoadingStep3,
    setUserLocation,
    setReferenceLocation,
    setNearestMarketplaces,
    setSelectedMarketplaceId,
    setVehicleId,
    setIsLoadingStep3,
  } = useForecastStore();

  // Determine if the user selected a different region from their current location
  const isRemoteRegion = regionId && regionId !== detectedRegionId;
  const selectedRegion = REGIONS.find((r) => r.id === regionId);
  const regionDisplayName = selectedRegion ? t(selectedRegion.nameKey) : '';

  const loadMarketplacesFrom = useCallback(async (coords: { lat: number; lng: number }) => {
    const mps = await findNearestMarketplaces(coords.lat, coords.lng, 5);
    setNearestMarketplaces(mps);
    setReferenceLocation(coords);
    if (mps.length > 0) {
      setSelectedMarketplaceId(mps[0].id);
    }
  }, []);

  useEffect(() => {
    const loadMarketplaces = async () => {
      if (nearestMarketplaces.length > 0) return;
      setIsLoadingStep3(true);
      try {
        // Get user's GPS location
        const { status } = await Location.requestForegroundPermissionsAsync();
        let gpsCoords: { lat: number; lng: number } | null = null;
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          gpsCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          setUserLocation(gpsCoords);
        }

        // Determine reference location: selected region center if different from detected, else GPS
        let refCoords = gpsCoords;
        if (isRemoteRegion && selectedRegion) {
          refCoords = { lat: selectedRegion.lat, lng: selectedRegion.lng };
          // Pre-fill search bar with the selected region's town name
          setSearchQuery(selectedRegion.name);
        }

        if (refCoords) {
          await loadMarketplacesFrom(refCoords);
        }

        // Auto-suggest vehicle based on harvest weight
        if (!vehicleId) {
          setVehicleId(suggestVehicleId(quantityKg));
        }
      } catch {}
      setIsLoadingStep3(false);
    };
    loadMarketplaces();
  }, []);

  const fetchSuggestions = useCallback((text: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        // Search marketplace names locally
        const allMarketplaces = await fetchMarketplaces();
        const lowerText = text.toLowerCase();
        const mpMatches = allMarketplaces
          .filter((mp) => mp.name.toLowerCase().includes(lowerText) || mp.district.toLowerCase().includes(lowerText))
          .slice(0, 3)
          .map((mp) => ({
            place_id: `mp_${mp.id}`,
            description: `${mp.name} — ${mp.district}, ${mp.province}`,
            lat: mp.latitude,
            lng: mp.longitude,
            type: 'marketplace' as const,
          }));

        // Search places via Nominatim
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(text)}&countrycodes=lk&format=json&limit=5&addressdetails=0`;
        const res = await fetch(url, { headers: { 'User-Agent': 'AgriPriceDSS/1.0' } });
        const data = await res.json();
        const placeMatches = Array.isArray(data)
          ? data.map((p: any) => ({
              place_id: String(p.place_id),
              description: p.display_name,
              lat: parseFloat(p.lat),
              lng: parseFloat(p.lon),
              type: 'place' as const,
            }))
          : [];

        // Show marketplace matches first, then place matches
        setSuggestions([...mpMatches, ...placeMatches]);
      } catch {
        setSuggestions([]);
      }
    }, 500);
  }, []);

  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);
    fetchSuggestions(text);
  };

  const selectSuggestion = async (item: { place_id: string; description: string; lat: number; lng: number }) => {
    Keyboard.dismiss();
    setSuggestions([]);
    setSearchQuery(item.description);
    setIsSearching(true);
    const coords = { lat: item.lat, lng: item.lng };
    setSearchedPlace({ lat: item.lat, lng: item.lng, name: item.description });
    await loadMarketplacesFrom(coords);
    mapRef.current?.animateToRegion({
      latitude: item.lat,
      longitude: item.lng,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    }, 500);
    setIsSearching(false);
  };

  const handleSearchPlace = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    Keyboard.dismiss();
    setSuggestions([]);
    setIsSearching(true);
    try {
      const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&countrycodes=lk&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'AgriPriceDSS/1.0' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const coords = { lat, lng };
        setSearchedPlace({ lat, lng, name: data[0].display_name });
        await loadMarketplacesFrom(coords);
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }, 500);
      }
    } catch {}
    setIsSearching(false);
  };

  const mapCenter = referenceLocation || userLocation;

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

      {/* Region info banner — shows when growing region differs from current location */}
      {isRemoteRegion && regionDisplayName ? (
        <View style={styles.regionBanner}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.regionBannerText}>
            {t('wizard.showingMarketsFor', { region: regionDisplayName })}
          </Text>
        </View>
      ) : null}

      {/* Map View */}
      {mapCenter && nearestMarketplaces.length > 0 ? (
        <View style={styles.mapContainer}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('wizard.searchPlaceOrShop')}
              value={searchQuery}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchPlace}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchPlace} disabled={isSearching}>
              {isSearching ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="search" size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <View style={styles.suggestionRow}>
                      <Ionicons
                        name={item.type === 'marketplace' ? 'storefront-outline' : 'location-outline'}
                        size={16}
                        color={item.type === 'marketplace' ? Colors.primary : Colors.textTertiary}
                        style={styles.suggestionIcon}
                      />
                      <Text style={styles.suggestionText} numberOfLines={1}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: mapCenter.lat,
              longitude: mapCenter.lng,
              latitudeDelta: 0.8,
              longitudeDelta: 0.8,
            }}
            showsUserLocation
            showsMyLocationButton={false}
            onMapReady={() => setIsMapReady(true)}
          >
            {searchedPlace && (
              <Marker
                coordinate={{ latitude: searchedPlace.lat, longitude: searchedPlace.lng }}
                pinColor={Colors.accentGold}
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{searchedPlace.name}</Text>
                    <Text style={styles.calloutSub}>{t('wizard.searchedLocation')}</Text>
                  </View>
                </Callout>
              </Marker>
            )}
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
          {!isMapReady && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.mapLoadingText}>{t('wizard.loadingMap')}</Text>
            </View>
          )}
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
                  <Ionicons name="location-sharp" size={14} color={Colors.textTertiary} /> {mp.district}, {mp.province}
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
              <MaterialCommunityIcons name={selectedVehicle.icon as any} size={24} color={Colors.primaryDark} />
              <View>
                <Text style={styles.dropdownTriggerText}>
                  {t(selectedVehicle.nameKey)}
                </Text>
                <Text style={styles.vehicleCapacity}>
                  Max: {selectedVehicle.maxCapacityKg} kg
                  {selectedVehicle.id === suggestedId && (
                    <Text style={styles.suggestedBadgeInline}> <Ionicons name="star" size={12} color={Colors.primary} /> {t('wizard.recommended')}</Text>
                  )}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.dropdownPlaceholder}>{t('wizard.selectVehicle')}</Text>
          )}
        </View>
        <Text style={styles.dropdownArrow}><Ionicons name={vehicleDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} /></Text>
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
                  <MaterialCommunityIcons name={vehicle.icon as any} size={24} color={isSelected ? Colors.primaryDark : Colors.textSecondary} />
                  <View>
                    <View style={styles.vehicleNameRow}>
                      <Text style={[styles.vehicleName, isSelected && styles.spotNameActive]}>
                        {t(vehicle.nameKey)}
                      </Text>
                      {isSuggested && (
                        <View style={styles.suggestedBadge}>
                          <Text style={styles.suggestedBadgeText}><Ionicons name="star" size={12} color={Colors.primary} /> {t('wizard.recommended')}</Text>
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
          <Text style={styles.summaryTitle}><Ionicons name="cube" size={18} color={Colors.primaryDark} /> {t('wizard.transportSummary')}</Text>
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

  // Region info banner
  regionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted + '30',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  regionBannerText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    flex: 1,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 13,
  },
  searchButton: {
    marginLeft: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  suggestionText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: Spacing.xs,
  },
  map: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
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

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { AppDropdown } from '../common/AppDropdown';
import { AppButton } from '../common/AppButton';
import { COMMODITIES } from '../../constants/commodities';
import { REGIONS } from '../../constants/regions';
import { useForecastStore } from '../../store/useForecastStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import * as locationService from '../../services/locationService';

interface Step1Props {
  scrollRef?: React.RefObject<ScrollView | null>;
}

const Step1CropDetails = ({ scrollRef }: Step1Props) => {
  const { t } = useTranslation();
  const {
    commodityId,
    regionId,
    targetDate,
    quantityKg,
    harvestingCost,
    setCommodityId,
    setRegionId,
    setTargetDate,
    setQuantityKg,
    setHarvestingCost,
  } = useForecastStore();
  const { detectedRegionId, setDetectedRegionId } = useSettingsStore();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [quantityText, setQuantityText] = useState(quantityKg > 0 ? String(quantityKg) : '');
  const [costText, setCostText] = useState(harvestingCost > 0 ? String(harvestingCost) : '');

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const region = await locationService.getCurrentRegion();
        if (region) {
          setDetectedRegionId(region.id);
          if (!regionId) setRegionId(region.id);
        }
      } catch {}
    };
    detectLocation();
  }, []);

  const commodityOptions = COMMODITIES.map((c) => ({
    id: c.id,
    label: t(c.nameKey),
    icon: c.icon,
  }));

  const regionOptions = REGIONS.map((r) => ({
    id: r.id,
    label: t(r.nameKey),
    iconComponent: <Ionicons name="location-sharp" size={18} color={Colors.primary} />,
    subtitle:
      r.id === detectedRegionId ? `${t('location.detected')}` : undefined,
  }));

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setTargetDate(selectedDate);
  };

  const handleQuantityChange = (text: string) => {
    setQuantityText(text);
    const num = parseFloat(text);
    setQuantityKg(!isNaN(num) && num > 0 ? num : 0);
  };

  const handleCostChange = (text: string) => {
    setCostText(text);
    const num = parseFloat(text);
    setHarvestingCost(!isNaN(num) && num >= 0 ? num : 0);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const scrollToInput = () => {
    setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('wizard.step1Title')}</Text>
      <Text style={styles.subheading}>{t('wizard.step1Desc')}</Text>

      <AppDropdown
        label={t('wizard.selectVegetable')}
        placeholder={t('wizard.selectVegetablePlaceholder')}
        options={commodityOptions}
        selectedId={commodityId}
        onSelect={setCommodityId}
      />

      <AppDropdown
        label={t('wizard.selectRegion')}
        placeholder={t('wizard.selectRegionPlaceholder')}
        options={regionOptions}
        selectedId={regionId}
        onSelect={setRegionId}
      />

      {detectedRegionId && regionId === detectedRegionId && (
        <View style={styles.detectedBadge}>
          <Text style={styles.detectedText}>
            <Ionicons name="radio" size={14} color={Colors.success} /> {t('location.autoDetected')}
          </Text>
        </View>
      )}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('wizard.targetDate')}</Text>
        <AppButton
          title={`  ${formatDate(targetDate)}`}
          variant="outline"
          onPress={() => setShowDatePicker(true)}
          icon={<Ionicons name="calendar" size={18} color={Colors.primary} />}
        />
        {showDatePicker && (
          <DateTimePicker
            value={targetDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('wizard.quantity')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={t('wizard.quantityPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            value={quantityText}
            onChangeText={handleQuantityChange}
            onFocus={scrollToInput}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>KG</Text>
          </View>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('wizard.harvestingCost')}</Text>
        <View style={styles.inputRow}>
          <View style={styles.rsBadge}>
            <Text style={styles.rsText}>Rs.</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder={t('wizard.harvestingCostPlaceholder')}
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            value={costText}
            onChangeText={handleCostChange}
            onFocus={scrollToInput}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  detectedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detectedText: {
    ...Typography.small,
    color: Colors.success,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  unitBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  unitText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
  rsBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rsText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
});

export default Step1CropDetails;

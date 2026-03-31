import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing } from '../theme';
import { AppButton } from '../components/common/AppButton';
import StepIndicator from '../components/common/StepIndicator';
import Step1CropDetails from '../components/wizard/Step1CropDetails';
import Step2WeatherPrice from '../components/wizard/Step2WeatherPrice';
import Step3MarketTransport from '../components/wizard/Step3MarketTransport';
import Step4ProfitAnalysis from '../components/wizard/Step4ProfitAnalysis';

import { useForecastStore } from '../store/useForecastStore';

const HomeScreen = () => {
  const { t } = useTranslation();
  const {
    currentStep,
    commodityId,
    regionId,
    quantityKg,
    harvestingCost,
    predictedPricePerKg,
    selectedMarketplaceId,
    vehicleId,
    nextStep,
    prevStep,
  } = useForecastStore();

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(commodityId && regionId && quantityKg > 0 && harvestingCost > 0);
      case 2:
        return predictedPricePerKg !== null;
      case 3:
        return !!(selectedMarketplaceId && vehicleId);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert(t('common.error'), t('wizard.fillAllFields'));
      return;
    }
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1CropDetails scrollRef={scrollRef} />;
      case 2:
        return <Step2WeatherPrice />;
      case 3:
        return <Step3MarketTransport />;
      case 4:
        return <Step4ProfitAnalysis />;
      default:
        return null;
    }
  };

  const scrollRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StepIndicator currentStep={currentStep} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
      <View style={styles.footer}>
        {currentStep > 1 && (
          <AppButton
            title={`← ${t('common.back')}`}
            variant="outline"
            onPress={prevStep}
            fullWidth={false}
            style={styles.backBtn}
          />
        )}
          <AppButton
            title={`${t('common.next')} →`}
            onPress={handleNext}
            disabled={!canProceed()}
            style={styles.nextBtn}
          />
      </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 200,
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.md,
  },
  backBtn: {
    flex: 0.4,
  },
  nextBtn: {
    flex: 1,
  },
});

export default HomeScreen;

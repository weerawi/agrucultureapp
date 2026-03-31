import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { Language } from '../types';

const LANGUAGES: { key: Language; label: string; native: string }[] = [
  { key: 'en', label: 'English', native: 'English' },
  { key: 'si', label: 'Sinhala', native: 'සිංහල' },
  { key: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

interface LanguageSelectScreenProps {
  onContinue: () => void;
}

const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onContinue }) => {
  const { language, setLanguage } = useSettingsStore();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/agriprice_logo-removebg.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>භාෂාව තෝරන්න · மொழியைத் தேர்ந்தெடுக்கவும்</Text>

        <View style={styles.langList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              style={[
                styles.langButton,
                language === lang.key && styles.langButtonActive,
              ]}
              onPress={() => handleSelect(lang.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.langNative,
                  language === lang.key && styles.langTextActive,
                ]}
              >
                {lang.native}
              </Text>
              {lang.key !== 'en' && (
                <Text
                  style={[
                    styles.langLabel,
                    language === lang.key && styles.langLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              )}
              {language === lang.key && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.8}>
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h3,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  langList: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  langButtonActive: {
    borderColor: Colors.primaryDark,
    backgroundColor: '#F0F7E8',
  },
  langNative: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 17,
  },
  langLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginRight: Spacing.md,
  },
  langLabelActive: {
    color: Colors.primaryDark,
  },
  langTextActive: {
    color: Colors.primaryDark,
  },
  checkIcon: {
    fontSize: 18,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.huge,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
});

export default LanguageSelectScreen;

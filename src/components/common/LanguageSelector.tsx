import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Language } from '../../types';

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'en', label: 'ENGLISH' },
  { key: 'si', label: 'සිංහල' },
  { key: 'ta', label: 'தமிழ்' },
];

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('language.preferred')}</Text>
      <View style={styles.buttonGroup}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            style={[
              styles.button,
              language === lang.key && styles.buttonActive,
            ]}
            onPress={() => setLanguage(lang.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                language === lang.key && styles.buttonTextActive,
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  buttonActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  buttonText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  buttonTextActive: {
    color: Colors.white,
  },
});

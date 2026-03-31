import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { AppButton } from '../components/common/AppButton';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import * as authService from '../services/firebase/authService';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { user, clearUser } = useAuthStore();
  const { detectedRegionId } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            clearUser();
          } catch {
            Alert.alert(t('common.error'), 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('settings.account').toUpperCase()}
          </Text>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(
                  user?.displayName?.[0] ||
                  user?.email?.[0] ||
                  'U'
                ).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.displayName || t('settings.farmer')}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('language.preferred').toUpperCase()}
          </Text>
          <View style={styles.card}>
            <LanguageSelector />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('settings.location').toUpperCase()}
          </Text>
          <View style={styles.card}>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={24} color={Colors.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>
                  {t('settings.detectedRegion')}
                </Text>
                <Text style={styles.locationValue}>
                  {detectedRegionId
                    ? t(`regions.${detectedRegionId}`)
                    : t('settings.notDetected')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: detectedRegionId
                      ? Colors.successLight
                      : Colors.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: detectedRegionId
                        ? Colors.success
                        : Colors.warning,
                    },
                  ]}
                >
                  {detectedRegionId
                    ? t('settings.active')
                    : t('settings.inactive')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('settings.about').toUpperCase()}
          </Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t('settings.developer')}</Text>
              <Text style={styles.aboutValue}>AgriPrice DSS Team</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t('settings.dataSource')}</Text>
              <Text style={styles.aboutValue}>Mock Data (v1)</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <AppButton
            title={t('auth.signOut')}
            variant="outline"
            onPress={handleSignOut}
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
          />
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('settings.copyright')}</Text>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.white,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  locationValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  aboutLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  aboutValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  copyright: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: Spacing.lg,
  },
});

export default SettingsScreen;

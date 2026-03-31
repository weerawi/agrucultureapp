import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { AppInput } from '../components/common/AppInput';
import { AppButton } from '../components/common/AppButton';
import { useAuthStore } from '../store/useAuthStore';
import * as authService from '../services/firebase/authService';

type AuthMode = 'signIn' | 'signUp';

const AuthScreen = () => {
  const { t } = useTranslation();
  const { setUser, setLoading, setError, loading, error } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('common.error'));
      return;
    }

    if (mode === 'signUp' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (mode === 'signIn') {
        user = await authService.signIn(email.trim(), password);
      } else {
        user = await authService.signUp(
          email.trim(),
          password,
          fullName.trim() || undefined
        );
      }
      setUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
      });
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err?.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : err?.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters'
          : err?.message || t('common.error');
      setError(message);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Name */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/agriprice_logo-removebg.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{t('app.name')}</Text>
          </View>

          {/* Auth Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signIn' && styles.tabActive]}
              onPress={() => setMode('signIn')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'signIn' && styles.tabTextActive,
                ]}
              >
                {t('auth.signIn')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signUp' && styles.tabActive]}
              onPress={() => setMode('signUp')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'signUp' && styles.tabTextActive,
                ]}
              >
                {t('auth.signUp')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Sign Up extra fields */}
          {mode === 'signUp' && (
            <AppInput
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}

          {/* Email */}
          <AppInput
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <AppInput
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            rightAction={
              mode === 'signIn'
                ? {
                    label: t('auth.forgotPassword'),
                    onPress: () =>
                      Alert.alert(
                        'Forgot Password',
                        'Password reset functionality will be available soon.'
                      ),
                  }
                : undefined
            }
          />

          {/* Confirm password for sign up */}
          {mode === 'signUp' && (
            <AppInput
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          {/* Auth Button */}
          <View style={styles.btnContainer}>
            <AppButton
              title={
                mode === 'signIn'
                  ? t('auth.secureSignIn')
                  : t('auth.createAccount')
              }
              onPress={handleAuth}
              loading={loading}
              size="lg"
            />
          </View>

          {/* Switch mode */}
          <TouchableOpacity onPress={switchMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'signIn'
                ? t('auth.noAccount')
                : t('auth.hasAccount')}{' '}
              <Text style={styles.switchLink}>
                {mode === 'signIn' ? t('auth.signUp') : t('auth.signIn')}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: Spacing.sm,
  },
  appName: {
    ...Typography.h4,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingBottom: Spacing.md,
    marginRight: Spacing.xl,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryDark,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    ...Typography.bodyBold,
    color: Colors.primaryDark,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  btnContainer: {
    marginTop: Spacing.md,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  switchText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  switchLink: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
});

export default AuthScreen;

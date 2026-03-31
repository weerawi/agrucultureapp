import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../theme';
import { useAuthStore } from '../store/useAuthStore';
import GlobalHeader from '../components/common/GlobalHeader';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ForecastTab: undefined;
  HistoryTab: undefined;
};

type OnboardingPhase = 'splash' | 'language' | 'auth';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({
  name,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
}) => (
  <Ionicons
    name={name}
    size={22}
    color={focused ? Colors.tabActive : Colors.tabInactive}
  />
);

const MainTabs = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        header: ({ navigation }) => (
          <GlobalHeader
            onProfilePress={() => navigation.navigate('Settings' as any)}
          />
        ),
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom, height: 60 + insets.bottom }],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('dashboard.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ForecastTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('dashboard.forecast'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: t('dashboard.history'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'clipboard' : 'clipboard-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('splash');

  if (!isAuthenticated) {
    if (onboardingPhase === 'splash') {
      return <SplashScreen onFinish={() => setOnboardingPhase('language')} />;
    }
    if (onboardingPhase === 'language') {
      return <LanguageSelectScreen onContinue={() => setOnboardingPhase('auth')} />;
    }
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <RootStack.Screen name="Tabs" component={MainTabs} />
          <RootStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: 'Profile',
              headerTintColor: Colors.primaryDark,
              headerStyle: { backgroundColor: Colors.backgroundCream },
            }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBackground,
    borderTopColor: Colors.borderLight,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 22,
  },
});

export default AppNavigator;

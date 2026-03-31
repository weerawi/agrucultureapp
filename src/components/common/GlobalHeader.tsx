import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';

interface GlobalHeaderProps {
  onProfilePress?: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onProfilePress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.titleRow}>
        <Image
          source={require('../../../assets/agriprice_logo-removebg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AgriPrice DSS</Text>
      </View>
      {onProfilePress && (
        <TouchableOpacity onPress={onProfilePress} style={styles.profileBtn}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
});

export default GlobalHeader;

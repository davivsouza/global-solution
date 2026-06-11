import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/colors';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <View
      style={[
        styles.logoShadow,
        {
          width: size,
          height: size,
          borderRadius: Math.max(radius.md, size * 0.22),
        },
      ]}
    >
      <Image
        source={require('../../assets/app-logo.png')}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(radius.md, size * 0.22),
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoShadow: {
    backgroundColor: '#07131f',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});

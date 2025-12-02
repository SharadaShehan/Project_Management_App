import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/spacing';

export default function Avatar({
  source,
  name,
  size = 'md',
  style,
  ...props
}) {
  const avatarSize = sizes[size];
  const fontSize = fontSizes[size];

  const avatarStyles = [
    styles.base,
    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
    style,
  ];

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <View style={avatarStyles} {...props}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.fallbackText, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const sizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

const fontSizes = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  fallbackText: {
    fontFamily: typography.fontFamily.default,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.dark,
  },
});

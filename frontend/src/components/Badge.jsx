import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  ...props
}) {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`size_${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyles} {...props}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[100],
  },
  secondary: {
    backgroundColor: colors.secondary[100],
  },
  success: {
    backgroundColor: colors.status.success + '20',
  },
  warning: {
    backgroundColor: colors.status.warning + '20',
  },
  error: {
    backgroundColor: colors.status.error + '20',
  },
  info: {
    backgroundColor: colors.status.info + '20',
  },
  neutral: {
    backgroundColor: colors.neutral[200],
  },

  // Sizes
  size_sm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  size_lg: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Text Styles
  baseText: {
    fontFamily: typography.fontFamily.default,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.dark,
  },
  secondaryText: {
    color: colors.secondary.dark,
  },
  successText: {
    color: colors.status.success,
  },
  warningText: {
    color: colors.status.warning,
  },
  errorText: {
    color: colors.status.error,
  },
  infoText: {
    color: colors.status.info,
  },
  neutralText: {
    color: colors.neutral[700],
  },
  size_smText: {
    fontSize: typography.fontSize.xs,
  },
  size_mdText: {
    fontSize: typography.fontSize.sm,
  },
  size_lgText: {
    fontSize: typography.fontSize.base,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

interface StyledTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  inputStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
}

export function StyledTextInput({ label, style, inputStyle, onFocus, onBlur, ...props }: StyledTextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const isMultiline = Boolean(props.multiline);

  return (
    <View style={[styles.container, style]}>
      <Text style={[typography.labelS, styles.label, { color: focused ? theme.accent : theme.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          isMultiline && styles.inputWrapMultiline,
          {
            backgroundColor: theme.surface,
            borderColor: focused ? theme.accent : border(theme),
          },
        ]}
      >
        <TextInput
          style={[
            typography.bodyM,
            styles.input,
            isMultiline && styles.inputMultiline,
            { color: theme.text },
            inputStyle,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  inputWrap: {
    borderWidth: 1,
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  inputWrapMultiline: {
    height: undefined,
    minHeight: 152,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    justifyContent: 'flex-start',
  },
  input: {
    paddingVertical: 0,
    minHeight: 24,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});

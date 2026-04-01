import { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAppTheme } from '@/providers/AppThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

interface AppInputProps extends TextInputProps {
  label?: string;
  helper?: string;
  leadingIcon?: IconName;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({
  label,
  helper,
  leadingIcon,
  multiline = false,
  containerStyle,
  style,
  ...props
}: AppInputProps) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.shell,
          {
            backgroundColor: theme.colors.surface,
            borderColor: focused ? theme.colors.borderStrong : theme.colors.border,
          },
          multiline && styles.shellMultiline,
        ]}
      >
        {leadingIcon ? (
          <Ionicons
            name={leadingIcon}
            size={16}
            color={focused ? theme.colors.textPrimary : theme.colors.textMuted}
            style={[styles.icon, multiline && styles.iconTop]}
          />
        ) : null}

        <TextInput
          {...props}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.accent}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontFamily: 'Manrope_400Regular',
            },
            multiline && styles.multilineInput,
            leadingIcon ? null : styles.noIcon,
            style,
          ]}
        />

        <AccentLine active={focused} />
      </View>

      {helper ? (
        <AppText variant="caption" style={styles.helper}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
  },
  shell: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shellMultiline: {
    alignItems: 'flex-start',
    paddingTop: 16,
    minHeight: 128,
  },
  icon: {
    marginRight: 10,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  noIcon: {
    paddingLeft: 0,
  },
  helper: {
    marginTop: 8,
  },
});

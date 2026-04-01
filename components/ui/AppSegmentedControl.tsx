import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAppTheme } from '@/providers/AppThemeProvider';

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface AppSegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function AppSegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: AppSegmentedControlProps<T>) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={styles.option}
          >
            <AppText
              variant="button"
              color={active ? theme.colors.textPrimary : theme.colors.textMuted}
            >
              {option.label}
            </AppText>
            <AccentLine active={active} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 52,
    borderWidth: 1,
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

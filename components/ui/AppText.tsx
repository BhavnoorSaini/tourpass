import {
  Text,
  type TextProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { useAppTheme } from '@/providers/AppThemeProvider';

type TextVariant =
  | 'brand'
  | 'display'
  | 'hero'
  | 'screenTitle'
  | 'sectionTitle'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'eyebrow'
  | 'button'
  | 'mono';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function AppText({
  variant = 'body',
  color,
  style,
  ...props
}: AppTextProps) {
  const { typography } = useAppTheme();

  return (
    <Text
      {...props}
      style={[
        typography[variant],
        color ? { color } : null,
        style,
      ]}
    />
  );
}

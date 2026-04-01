import { StyleSheet, Switch, View } from 'react-native';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppListRow } from '@/components/ui/AppListRow';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppText } from '@/components/ui/AppText';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

type MapTypeValue = 'standard' | 'satellite' | 'hybrid';
type LightPresetValue = 'day' | 'dawn' | 'dusk' | 'night';

const mapTypeOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Hybrid', value: 'hybrid' },
] as const satisfies readonly { label: string; value: MapTypeValue }[];

const lightPresetOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Dawn', value: 'dawn' },
  { label: 'Dusk', value: 'dusk' },
  { label: 'Night', value: 'night' },
] as const satisfies readonly { label: string; value: LightPresetValue }[];

export default function PreferencesScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const {
    mapStyle,
    changeMapStyle,
    lightPreset,
    isStandardMapStyle,
    changeLightPreset,
    is3DEnabled,
    setIs3DEnabled,
  } = usePreferences();

  const getActiveType = (url: string): MapTypeValue => {
    if (url.includes('satellite-streets')) return 'hybrid';
    if (url.includes('satellite')) return 'satellite';
    return 'standard';
  };

  const currentType = getActiveType(mapStyle);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Preferences"
        title="Map settings tuned for a minimal browsing flow."
        subtitle="Control the display without crowding the screen."
      />

      <AppSection title="Map style" subtitle="Choose the base visual language for browsing and route building">
        <AppSegmentedControl options={mapTypeOptions} value={currentType} onChange={changeMapStyle} />
      </AppSection>

      <AppSection title="Map lighting" subtitle="Only available on the standard map">
        <View style={styles.stack}>
          <AppSegmentedControl
            options={lightPresetOptions}
            value={lightPreset}
            onChange={(value) => {
              if (isStandardMapStyle) {
                changeLightPreset(value);
              }
            }}
          />
          {!isStandardMapStyle ? (
            <AppText variant="caption">
              Switch back to the standard map to adjust the lighting preset.
            </AppText>
          ) : null}
        </View>
      </AppSection>

      <AppSection title="Depth" subtitle="Keep the map flatter or turn 3D buildings back on">
        <AppListRow
          title="3D buildings"
          subtitle="Available on the standard map style only."
          trailingChevron={false}
          accessory={
            <Switch
              value={is3DEnabled}
              onValueChange={setIs3DEnabled}
              disabled={!isStandardMapStyle}
              trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.accentSoft }}
              thumbColor={theme.colors.textPrimary}
            />
          }
        />
      </AppSection>
    </AppScreen>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: 16,
    },
    stack: {
      gap: 16,
    },
  });

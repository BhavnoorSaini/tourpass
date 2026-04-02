import React, { useState } from 'react';
import { View, Text, Switch, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

interface SegmentButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function SegmentButton({ label, active, onPress, disabled }: SegmentButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.segmentButton,
        active && { backgroundColor: theme.background },
        disabled && { opacity: 0.5 }
      ]}
    >
      <Text style={[
        typography.labelS,
        { color: active ? theme.text : theme.textSecondary }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PreferencesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    mapStyle,
    changeMapStyle,
    lightPreset,
    isStandardMapStyle,
    changeLightPreset,
    is3DEnabled,
    setIs3DEnabled
  } = usePreferences();

  const getActiveType = (url: string) => {
    if (url.includes('satellite-streets')) return 'hybrid';
    if (url.includes('satellite')) return 'satellite';
    return 'standard';
  };

  const currentType = getActiveType(mapStyle);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title="Preferences" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>

        <View style={styles.section}>
          <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
            Map Appearance
          </Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyM, { color: theme.text }]}>Style</Text>
                <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
                  Satellite or vector
                </Text>
              </View>
              <View style={[styles.segmentContainer, { backgroundColor: theme.surfaceRaised }]}>
                <SegmentButton label="Std" active={currentType === 'standard'} onPress={() => changeMapStyle('standard')} />
                <SegmentButton label="Sat" active={currentType === 'satellite'} onPress={() => changeMapStyle('satellite')} />
                <SegmentButton label="Hyb" active={currentType === 'hybrid'} onPress={() => changeMapStyle('hybrid')} />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.background }]} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyM, { color: isStandardMapStyle ? theme.text : theme.textSecondary }]}>
                  Lighting
                </Text>
              </View>
              <View style={[styles.segmentContainer, { backgroundColor: theme.surfaceRaised, opacity: isStandardMapStyle ? 1 : 0.5 }]}>
                <SegmentButton label="Day" active={lightPreset === 'day'} onPress={() => changeLightPreset('day')} disabled={!isStandardMapStyle} />
                <SegmentButton label="Dusk" active={lightPreset === 'dusk'} onPress={() => changeLightPreset('dusk')} disabled={!isStandardMapStyle} />
                <SegmentButton label="Night" active={lightPreset === 'night'} onPress={() => changeLightPreset('night')} disabled={!isStandardMapStyle} />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.background }]} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyM, { color: isStandardMapStyle ? theme.text : theme.textSecondary }]}>
                  3D Buildings
                </Text>
              </View>
              <Switch
                value={is3DEnabled}
                onValueChange={setIs3DEnabled}
                disabled={!isStandardMapStyle}
                trackColor={{ false: theme.surfaceRaised, true: theme.accent }}
                ios_backgroundColor={theme.surfaceRaised}
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 2,
    gap: 2,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
});

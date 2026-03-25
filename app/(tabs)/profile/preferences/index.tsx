import { StyleSheet, View } from "react-native";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
  ProfileSegmentedControl,
  ProfileToggleRow,
} from "@/components/profile/ProfileScaffold";

const MAP_OPTIONS = [
  { label: "Standard", value: "standard" },
  { label: "Satellite", value: "satellite" },
  { label: "Hybrid", value: "hybrid" },
] as const;

const LIGHT_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Dawn", value: "dawn" },
  { label: "Dusk", value: "dusk" },
  { label: "Night", value: "night" },
] as const;

export default function PreferencesScreen() {
  const {
    mapStyle,
    changeMapStyle,
    lightPreset,
    changeLightPreset,
    is3DEnabled,
    setIs3DEnabled,
  } = usePreferences();

  const getActiveType = (url: string) => {
    if (url.includes("satellite-streets")) return "hybrid";
    if (url.includes("satellite")) return "satellite";
    return "standard";
  };

  const currentType = getActiveType(mapStyle);
  const lightingDisabled = currentType !== "standard";

  return (
    <ProfileScaffold
      title="Preferences"
      subtitle="Map display and in-app viewing defaults."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Map">
            <View style={styles.stack}>
              <ProfileSegmentedControl
                label="Map style"
                options={MAP_OPTIONS}
                value={currentType}
                onChange={changeMapStyle}
              />
              <View style={styles.divider} />
              <ProfileSegmentedControl
                label="Map lighting"
                options={LIGHT_OPTIONS}
                value={lightPreset}
                onChange={changeLightPreset}
                disabled={lightingDisabled}
                helper={
                  lightingDisabled
                    ? "Lighting is available only for the standard map."
                    : "Choose how the standard map is lit."
                }
              />
              <View style={styles.divider} />
              <ProfileToggleRow
                label="3D buildings"
                subtitle="Show building height and pitch."
                value={is3DEnabled}
                onValueChange={setIs3DEnabled}
              />
            </View>
          </ProfileSectionBlock>
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  stack: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

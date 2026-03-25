import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferences } from '../../../../contexts/PreferencesContext';

interface MapTypeButtonProps {
    label: string;
    value: 'standard' | 'satellite' | 'hybrid';
}

interface LightPresetButtonProps {
    label: string;
    value: 'day' | 'night' | 'dusk' | 'dawn';
}

export default function PreferencesScreen() {
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

    const MapTypeButton = ({ label, value }: MapTypeButtonProps) => (
        <TouchableOpacity
            style={[styles.segmentButton, currentType === value && styles.activeSegment]}
            onPress={() => changeMapStyle(value)}
        >
            <Text style={[styles.segmentText, currentType === value && styles.activeSegmentText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const LightPresetButton = ({ label, value }: LightPresetButtonProps) => (
        <TouchableOpacity
            style={[styles.segmentButton, lightPreset === value && styles.activeSegment]}
            onPress={() => {
                if (isStandardMapStyle) {
                    changeLightPreset(value);
                }
            }}
            activeOpacity={isStandardMapStyle ? 0.2 : 1}
        >
            <Text style={[styles.segmentText, lightPreset === value && styles.activeSegmentText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: '#0C1A30' },
                headerTintColor: '#FFFFFF',
                headerTitle: "Preferences",
                headerShadowVisible: false
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionHeader}>MAP DISPLAY</Text>
                <View style={styles.card}>

                    <Text style={styles.label}>Map Style</Text>
                    <Text style={styles.subLabel}>Choose the map look you want for browsing and route building.</Text>
                    <View style={styles.segmentContainer}>
                        <MapTypeButton label="Standard" value="standard" />
                        <MapTypeButton label="Satellite" value="satellite" />
                        <MapTypeButton label="Hybrid" value="hybrid" />
                    </View>

                    <View style={styles.divider} />

                    <Text style={[styles.label, !isStandardMapStyle && styles.disabledSection]}>Map Lighting</Text>
                    <Text style={[styles.subLabel, !isStandardMapStyle && styles.disabledSection]}>
                        Available on the standard map only.
                    </Text>
                    <View style={[styles.segmentContainer, !isStandardMapStyle && styles.disabledSection]}>
                        <LightPresetButton label="Day" value="day" />
                        <LightPresetButton label="Dawn" value="dawn" />
                        <LightPresetButton label="Dusk" value="dusk" />
                        <LightPresetButton label="Night" value="night" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, !isStandardMapStyle && styles.disabledSection]}>3D Buildings</Text>
                            <Text style={[styles.subLabel, !isStandardMapStyle && styles.disabledSection]}>
                                Available on the standard map only.
                            </Text>
                        </View>
                        <Switch
                            value={is3DEnabled}
                            onValueChange={setIs3DEnabled}
                            disabled={!isStandardMapStyle}
                            trackColor={{ false: '#263B5E', true: '#745BFF' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0C1A30',
    },
    scrollContent: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#637A9F',
        marginBottom: 8,
        marginLeft: 12,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#203250',
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 17,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    subLabel: {
        fontSize: 13,
        color: '#A2B4CE',
        marginTop: 4,
        marginBottom: 10,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#354A6E',
        marginVertical: 14,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#0C1A30',
        borderRadius: 10,
        padding: 4,
        marginTop: 6,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeSegment: {
        backgroundColor: '#2D446B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#637A9F',
    },
    activeSegmentText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    disabledSection: {
        opacity: 0.4,
    },
});

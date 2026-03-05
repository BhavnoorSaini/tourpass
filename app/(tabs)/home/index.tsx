import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Map from '@/components/map/map';

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Map />
            <TouchableOpacity
                style={styles.tourButton}
                onPress={() => router.push('/(tabs)/home/tour')}
            >
                <Text style={styles.tourButtonText}>🗺️ Start Testing Tour</Text>
                <Text style={styles.tourSubtext}>Cloud Gate → Navy Pier → Willis Tower</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tourButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#4264fb',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tourButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    tourSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 3,
    },
});

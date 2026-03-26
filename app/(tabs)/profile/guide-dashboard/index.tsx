import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";

interface TourRequest {
    id: string;
    status: string;
    created_at: string;
    tourist_id: string;
    route_id: string;
    routes: { title: string } | null;
    profiles: { first_name: string | null; last_name: string | null } | null;
}

export default function GuideDashboard() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [requests, setRequests] = useState<TourRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setLoading(true);

        // Get IDs of routes this guide created
        const { data: myRoutes } = await supabase
            .from("routes")
            .select("id")
            .eq("creator_id", user.id);

        const routeIds = myRoutes?.map((r) => r.id) ?? [];

        if (routeIds.length === 0) {
            setRequests([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("tour_requests")
            .select("id, status, created_at, tourist_id, route_id, routes(title), profiles!tourist_id(first_name, last_name)")
            .in("route_id", routeIds)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (!error) {
            setRequests((data as unknown as TourRequest[]) ?? []);
        }

        setLoading(false);
    }, []);

    useFocusEffect(useCallback(() => { fetchRequests(); }, [fetchRequests]));

    const handleAccept = async (request: TourRequest) => {
        setActionLoading(request.id);

        const { error } = await supabase
            .from("tour_requests")
            .update({ status: "accepted", guide_id: userId })
            .eq("id", request.id);

        setActionLoading(null);

        if (error) {
            Alert.alert("Error", error.message);
            return;
        }

        setRequests((prev) => prev.filter((r) => r.id !== request.id));
    };

    const handleDecline = async (request: TourRequest) => {
        Alert.alert("Decline Request", "Are you sure you want to decline this request?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Decline",
                style: "destructive",
                onPress: async () => {
                    setActionLoading(request.id);

                    const { error } = await supabase
                        .from("tour_requests")
                        .update({ status: "cancelled" })
                        .eq("id", request.id);

                    setActionLoading(null);

                    if (error) {
                        Alert.alert("Error", error.message);
                        return;
                    }

                    setRequests((prev) => prev.filter((r) => r.id !== request.id));
                },
            },
        ]);
    };

    const completedCount = 0; // placeholder until completed tours are tracked
    const activeCount = requests.length;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Stats */}
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Earnings Overview</Text>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statValue}>$0</Text>
                        <Text style={styles.statLabel}>Total Earnings</Text>
                    </View>
                    <View>
                        <Text style={styles.statValue}>{completedCount}</Text>
                        <Text style={styles.statLabel}>Completed Tours</Text>
                    </View>
                    <View>
                        <Text style={styles.statValue}>{activeCount}</Text>
                        <Text style={styles.statLabel}>Pending Requests</Text>
                    </View>
                </View>
            </View>

            {/* Pending Requests */}
            <View style={styles.requestsCard}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>

                {loading ? (
                    <ActivityIndicator color="#60a5fa" style={{ marginTop: 12 }} />
                ) : requests.length === 0 ? (
                    <Text style={styles.emptyText}>No pending tour requests yet.</Text>
                ) : (
                    requests.map((request) => {
                        const firstName = request.profiles?.first_name ?? '';
                        const lastName = request.profiles?.last_name ?? '';
                        const touristName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Tourist';
                        const routeTitle = request.routes?.title ?? 'Unknown Route';
                        const isActioning = actionLoading === request.id;

                        return (
                            <View key={request.id} style={styles.requestItem}>
                                <View style={styles.requestInfo}>
                                    <Text style={styles.requestTourist}>{touristName}</Text>
                                    <Text style={styles.requestRoute}>{routeTitle}</Text>
                                    <Text style={styles.requestDate}>
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.requestActions}>
                                    {isActioning ? (
                                        <ActivityIndicator color="#60a5fa" />
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                style={styles.acceptButton}
                                                onPress={() => handleAccept(request)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.acceptText}>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.declineButton}
                                                onPress={() => handleDecline(request)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.declineText}>Decline</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </View>

            {/* Create Route */}
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/(tabs)/home/create-route")}
                activeOpacity={0.8}
            >
                <Text style={styles.createButtonText}>Create New Route</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    statsCard: {
        backgroundColor: "#1e3a5f",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    statsTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statValue: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
    statLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginTop: 2,
    },
    requestsCard: {
        backgroundColor: "#171717",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    emptyText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
    },
    requestItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.1)",
        gap: 12,
    },
    requestInfo: {
        flex: 1,
    },
    requestTourist: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    requestRoute: {
        color: "#60a5fa",
        fontSize: 13,
        marginTop: 2,
    },
    requestDate: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
        marginTop: 3,
    },
    requestActions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    acceptButton: {
        backgroundColor: "#16a34a",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    acceptText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
    },
    declineButton: {
        backgroundColor: "rgba(220,38,38,0.15)",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: "rgba(220,38,38,0.4)",
    },
    declineText: {
        color: "#f87171",
        fontSize: 13,
        fontWeight: "600",
    },
    createButton: {
        backgroundColor: "#1d4ed8",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    createButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function MessageScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchChats = async () => {
            // Fetch tour requests where the user is either the tourist or the guide
            // and the status is active (e.g., accepted or in_progress)
            const { data, error } = await supabase
                .from('tour_requests')
                .select(`
                    id, 
                    status,
                    route:route_id (title, city)
                `)
                .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
                .in('status', ['accepted', 'in_progress'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching chats:", error);
            } else {
                setChats(data || []);
            }
            setLoading(false);
        };

        fetchChats();
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0B1D3A] justify-center items-center">
                <ActivityIndicator color="#38BDF8" size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0B1D3A]">
            <View className="px-6 pt-4 pb-2 border-b border-white/10">
                <Text className="text-2xl font-bold text-white">Messages</Text>
            </View>

            {chats.length === 0 ? (
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-white/60 text-center text-lg">
                        No active tours yet. Request a tour to start chatting!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/message/${item.id}`)}
                            className="bg-white/5 p-4 rounded-2xl mb-3 border border-white/10"
                        >
                            <Text className="text-white font-bold text-lg">
                                {item.route?.title || "Custom Tour"}
                            </Text>
                            <Text className="text-[#38BDF8] mt-1 capitalize">
                                Status: {item.status.replace('_', ' ')}
                            </Text>
                            <Text className="text-white/50 text-sm mt-2">
                                Tap to view conversation
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
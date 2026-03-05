import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ChatRoomScreen() {
    const { id: tourRequestId } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!user || !tourRequestId) return;

        // 1. Fetch history
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('tour_request_id', tourRequestId)
                .order('created_at', { ascending: false });

            if (data) setMessages(data);
        };

        fetchMessages();

        // 2. Subscribe to real-time incoming messages
        const channel = supabase
            .channel(`chat_${tourRequestId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `tour_request_id=eq.${tourRequestId}`
                },
                (payload) => {
                    // Prepend new messages because FlatList is inverted
                    setMessages((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tourRequestId, user]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        // Optimistic clear to make the UI feel instantly responsive
        const textToSend = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase.from('messages').insert({
            tour_request_id: tourRequestId,
            sender_id: user.id,
            content: textToSend,
        });

        if (error) {
            console.error("Error sending message:", error);
            // Optionally set the message back into the input if it fails
            setNewMessage(textToSend);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0B1D3A]" edges={['top']}>
            {/* Custom Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-white/10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-[#38BDF8] text-lg font-medium">Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-4">Chat</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust based on your tab bar height
            >
                {/* Using inverted={true} means the list starts from the bottom.
                  This ensures the newest messages stay at the bottom of the screen.
                */}
                <FlatList
                    data={messages}
                    inverted
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        const isMe = item.sender_id === user?.id;
                        return (
                            <View className={`mb-4 max-w-[80%] rounded-2xl p-4 ${
                                isMe ? 'bg-[#0284C7] self-end rounded-br-sm' : 'bg-white/10 self-start rounded-bl-sm'
                            }`}>
                                <Text className="text-white text-base">{item.content}</Text>
                            </View>
                        );
                    }}
                />

                {/* Input Area */}
                <View className="flex-row items-center px-4 py-3 bg-[#0B1D3A] border-t border-white/10 pb-8">
                    <View className="flex-1 flex-row items-center bg-white/10 rounded-full px-4 min-h-[50px]">
                        <TextInput
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            className="flex-1 text-white text-base py-3"
                            multiline
                            maxLength={500}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!newMessage.trim()}
                        className={`ml-3 p-3 rounded-full ${newMessage.trim() ? 'bg-[#38BDF8]' : 'bg-white/10'}`}
                    >
                        <IconSymbol name="paperplane.fill" size={20} color={newMessage.trim() ? '#0B1D3A' : '#ffffff50'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
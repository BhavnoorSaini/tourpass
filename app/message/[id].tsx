import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatRoomScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const isCustom = type === 'custom';
  const parentColumn = isCustom ? 'custom_route_id' : 'tour_request_id';
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq(parentColumn, id)
        .order('created_at', { ascending: false });

      if (data) setMessages(data as ChatMessage[]);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${parentColumn}_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `${parentColumn}=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as ChatMessage, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, parentColumn, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    const payload: Record<string, string> = {
      sender_id: user.id,
      content: textToSend,
    };
    payload[parentColumn] = id;

    const { error } = await supabase.from('messages').insert(payload);

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(textToSend);
    }
  };

  const canSend = newMessage.trim().length > 0;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { borderBottomColor: border(theme) }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[typography.headingM, { color: theme.text }]} numberOfLines={1}>
            {isCustom ? 'Custom Tour Chat' : 'Chat'}
          </Text>
        </View>
        <View style={styles.headerRightSlot} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            return (
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? [styles.bubbleMe, { backgroundColor: theme.accent }]
                    : [styles.bubbleThem, { backgroundColor: theme.surface }],
                ]}
              >
                <Text
                  style={[
                    typography.bodyM,
                    { color: isMe ? theme.accentText : theme.text },
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="chatbubble-outline"
                size={28}
                color={theme.textTertiary}
              />
              <Text
                style={[
                  typography.bodyM,
                  { color: theme.textTertiary, marginTop: spacing.sm, textAlign: 'center' },
                ]}
              >
                Say hello to get the conversation started.
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.composer,
            {
              backgroundColor: theme.background,
              borderTopColor: border(theme),
            },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: border(theme) },
            ]}
          >
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={theme.textTertiary}
              style={[typography.bodyM, styles.input, { color: theme.text }]}
              multiline
              maxLength={500}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend ? theme.accent : theme.surface,
                opacity: canSend ? 1 : 0.6,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={canSend ? theme.accentText : theme.textTertiary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightSlot: {
    width: 36,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: radius.sm,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: radius.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    // Empty state needs to render right-side-up in the inverted list.
    transform: [{ scaleY: -1 }],
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

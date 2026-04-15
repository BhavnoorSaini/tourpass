import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  const [guideId, setGuideId] = useState<string | null>(null);
  const [tourStatus, setTourStatus] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const parentTable = isCustom ? 'custom_routes' : 'tour_requests';

    const fetchParent = async () => {
      const { data } = await supabase
        .from(parentTable)
        .select('guide_id, status')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setGuideId((data as { guide_id: string | null }).guide_id);
        setTourStatus((data as { status: string }).status);
      }
    };

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq(parentColumn, id)
        .order('created_at', { ascending: false });

      if (data) setMessages(data as ChatMessage[]);
    };

    fetchParent();
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
  }, [id, isCustom, parentColumn, user]);

  useEffect(() => {
    if (!id) return;

    const parentTable = isCustom ? 'custom_routes' : 'tour_requests';
    const channel = supabase
      .channel(`chat_parent_${parentTable}_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: parentTable,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const next = payload.new as { guide_id?: string | null; status?: string | null };
          if (typeof next.guide_id !== 'undefined') {
            setGuideId(next.guide_id ?? null);
          }
          if (typeof next.status === 'string') {
            setTourStatus(next.status);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isCustom]);

  const handleCompleteTour = () => {
    if (!user || !id || completing) return;

    Alert.alert(
      'Complete Tour',
      'Mark this tour as completed? This will move it out of your active chats.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompleting(true);
            const parentTable = isCustom ? 'custom_routes' : 'tour_requests';
            const { error } = await supabase
              .from(parentTable)
              .update({ status: 'completed' })
              .eq('id', id);
            setCompleting(false);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            setTourStatus('completed');
            router.back();
          },
        },
      ],
    );
  };

  const canCompleteTour =
    user?.id === guideId && tourStatus !== 'completed' && tourStatus !== 'cancelled';
  const isConversationClosed = tourStatus === 'completed' || tourStatus === 'cancelled';

  const handleSend = async () => {
    if (!newMessage.trim() || !user || isConversationClosed) return;

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

  const canSend = !isConversationClosed && newMessage.trim().length > 0;

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
        {canCompleteTour ? (
          <Pressable
            onPress={handleCompleteTour}
            disabled={completing}
            style={[
              styles.completeButton,
              {
                borderColor: border(theme),
                opacity: completing ? 0.5 : 1,
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="checkmark" size={16} color={theme.text} />
            <Text style={[typography.labelS, { color: theme.text, marginLeft: 4 }]}>
              Complete
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerRightSlot} />
        )}
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
          {isConversationClosed ? (
            <View style={styles.closedBanner}>
              <Ionicons
                name={tourStatus === 'completed' ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[typography.bodyS, { color: theme.textSecondary }]}>
                {tourStatus === 'completed'
                  ? 'This tour is completed and now lives in history.'
                  : 'This conversation is closed.'}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: border(theme) },
            ]}
          >
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={isConversationClosed ? 'This chat is closed' : 'Type a message...'}
              placeholderTextColor={theme.textTertiary}
              style={[typography.bodyM, styles.input, { color: theme.text }]}
              multiline
              maxLength={500}
              editable={!isConversationClosed}
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
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
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  closedBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
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

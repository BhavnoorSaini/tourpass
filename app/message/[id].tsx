import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

interface MessageRow {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatRoomScreen() {
  const { id: tourRequestId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user || !tourRequestId) {
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('tour_request_id', tourRequestId)
        .order('created_at', { ascending: false });

      if (data) {
        setMessages(data as MessageRow[]);
      }
    };

    void fetchMessages();

    const channel = supabase
      .channel(`chat_${tourRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tour_request_id=eq.${tourRequestId}`,
        },
        (payload) => {
          setMessages((previous) => [payload.new as MessageRow, ...previous]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tourRequestId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) {
      return;
    }

    const textToSend = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      tour_request_id: tourRequestId,
      sender_id: user.id,
      content: textToSend,
    });

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(textToSend);
    }
  };

  const headerTitle = useMemo(() => `Thread ${String(tourRequestId).slice(0, 6)}`, [tourRequestId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
        </Pressable>

        <View style={styles.headerCopy}>
          <AppText variant="label">Conversation</AppText>
          <AppText variant="sectionTitle">{headerTitle}</AppText>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
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
              <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMine : null]}>
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? {
                          backgroundColor: theme.colors.surfaceInverse,
                          borderColor: theme.colors.surfaceInverse,
                        }
                      : {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                  ]}
                >
                  <AppText
                    variant="bodyStrong"
                    color={isMe ? theme.colors.textInverse : theme.colors.textPrimary}
                  >
                    {item.content}
                  </AppText>
                </View>
              </View>
            );
          }}
        />

        <AppSurface style={styles.composer}>
          <View style={styles.composerInner}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              multiline
              maxLength={500}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleSend}
              disabled={!newMessage.trim()}
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
            >
              <Ionicons
                name="send-outline"
                size={18}
                color={newMessage.trim() ? theme.colors.textPrimary : theme.colors.textMuted}
              />
              <AccentLine active={Boolean(newMessage.trim())} />
            </Pressable>
          </View>
        </AppSurface>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.lg,
    },
    header: {
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    backButton: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCopy: {
      gap: 4,
    },
    keyboard: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.sm,
    },
    bubbleRow: {
      marginBottom: theme.spacing.xs,
      alignItems: 'flex-start',
    },
    bubbleRowMine: {
      alignItems: 'flex-end',
    },
    bubble: {
      maxWidth: '82%',
      borderWidth: 1,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    composer: {
      margin: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    composerInner: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      color: theme.colors.textPrimary,
      fontFamily: 'Manrope_400Regular',
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 12,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.55,
    },
  });

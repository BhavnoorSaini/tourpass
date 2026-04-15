import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { getHiddenChatKeys, hideChatKeyForUser, type HiddenChatKey } from '@/lib/chat-history';

type ChatKind = 'tour_request' | 'custom_route';

interface ChatEntry {
  key: HiddenChatKey;
  id: string;
  kind: ChatKind;
  title: string;
  subtitle: string;
  details?: string;
  sortKey: string;
  status: string;
  isHistory: boolean;
}

interface ChatSection {
  title: string;
  data: ChatEntry[];
}

function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function trimText(value: string | null | undefined, maxLength: number) {
  if (!value) return undefined;
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

export default function MessageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenChatKeys, setHiddenChatKeys] = useState<HiddenChatKey[]>([]);
  const [deletingKey, setDeletingKey] = useState<HiddenChatKey | null>(null);

  useEffect(() => {
    setHiddenChatKeys(getHiddenChatKeys(user));
  }, [user]);

  const fetchChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const tourRequestsPromise = supabase
      .from('tour_requests')
      .select('id, status, created_at, route:route_id (title, city)')
      .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('created_at', { ascending: false });

    const customRoutesPromise = supabase
      .from('custom_routes')
      .select('id, status, created_at, places, request_date')
      .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('created_at', { ascending: false });

    const [tourResult, customResult] = await Promise.all([
      tourRequestsPromise,
      customRoutesPromise,
    ]);

    if (tourResult.error) console.error('Error fetching tour chats:', tourResult.error);
    if (customResult.error) console.error('Error fetching custom chats:', customResult.error);

    const tourEntries: ChatEntry[] = (tourResult.data ?? []).map((row: any) => ({
      key: `tr:${row.id}`,
      id: row.id,
      kind: 'tour_request',
      title: row.route?.title || row.route?.city || 'Tour',
      subtitle: formatStatusLabel(row.status as string),
      details: trimText(row.route?.city, 48),
      sortKey: row.created_at,
      status: row.status,
      isHistory: row.status === 'completed',
    }));

    const customEntries: ChatEntry[] = (customResult.data ?? []).map((row: any) => ({
      key: `cr:${row.id}`,
      id: row.id,
      kind: 'custom_route',
      title: 'Custom Tour',
      subtitle: formatStatusLabel(row.status as string),
      details: trimText(row.places, 48),
      sortKey: row.created_at,
      status: row.status,
      isHistory: row.status === 'completed',
    }));

    const hiddenKeySet = new Set(hiddenChatKeys);
    const merged = [...tourEntries, ...customEntries]
      .filter((entry) => !hiddenKeySet.has(entry.key))
      .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));

    setChats(merged);
    setLoading(false);
  }, [hiddenChatKeys, user]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats]),
  );

  const handleDeleteFromHistory = (item: ChatEntry) => {
    if (!user || item.status !== 'completed' || deletingKey) return;

    Alert.alert(
      'Delete from History',
      'This removes the completed tour from your history only. The other person will still keep their copy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingKey(item.key);
            const { error, nextKeys } = await hideChatKeyForUser(user, item.key, hiddenChatKeys);
            setDeletingKey(null);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            setHiddenChatKeys(nextKeys);
            setChats((prev) => prev.filter((chat) => chat.key !== item.key));
          },
        },
      ],
    );
  };

  const activeChats = chats.filter((chat) => !chat.isHistory);
  const historyChats = chats.filter((chat) => chat.isHistory);
  const sections: ChatSection[] = [];

  if (activeChats.length > 0) {
    sections.push({ title: 'Active', data: activeChats });
  }
  if (historyChats.length > 0) {
    sections.push({ title: 'History', data: historyChats });
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: border(theme) }]}>
        <Text style={[typography.labelS, { color: theme.textTertiary }]}>Tourpass</Text>
        <Text style={[typography.displayM, { color: theme.text, marginTop: spacing.xs }]}>
          Messages
        </Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={32} color={theme.textTertiary} />
          <Text
            style={[
              typography.bodyM,
              { color: theme.textTertiary, marginTop: spacing.md, textAlign: 'center' },
            ]}
          >
            No conversations yet.{'\n'}Request a tour to start chatting.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[typography.labelS, { color: theme.textSecondary }]}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              deleting={deletingKey === item.key}
              onPress={() =>
                router.push(
                  item.kind === 'custom_route'
                    ? (`/message/${item.id}?type=custom` as never)
                    : (`/message/${item.id}` as never),
                )
              }
              onDelete={() => handleDeleteFromHistory(item)}
            />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRow({
  item,
  deleting,
  onPress,
  onDelete,
}: {
  item: ChatEntry;
  deleting: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <View
      style={[
        styles.chatRow,
        {
          borderBottomColor: border(theme, pressed),
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={styles.chatPressable}
      >
        <View style={styles.chatContent}>
          <Text style={[typography.headingS, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[typography.bodyS, styles.subtitle, { color: theme.textSecondary }]}>
            {item.subtitle}
          </Text>
          {item.details ? (
            <Text
              style={[typography.bodyS, { color: theme.textTertiary, marginTop: 2 }]}
              numberOfLines={1}
            >
              {item.details}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
      </Pressable>

      {item.isHistory ? (
        <Pressable
          onPress={onDelete}
          disabled={deleting}
          style={[
            styles.deleteButton,
            {
              backgroundColor: theme.surface,
              borderColor: border(theme),
              opacity: deleting ? 0.6 : 1,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  list: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    minHeight: 76,
  },
  chatPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  chatContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: spacing.sm,
  },
});

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { spacing } from '@/constants/spacing';

type ChatKind = 'tour_request' | 'custom_route';

interface ChatEntry {
  key: string;
  id: string;
  kind: ChatKind;
  title: string;
  subtitle: string;
  sortKey: string;
}

export default function MessageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false });

    const customRoutesPromise = supabase
      .from('custom_routes')
      .select('id, status, created_at, places, request_date')
      .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false });

    const [tourResult, customResult] = await Promise.all([
      tourRequestsPromise,
      customRoutesPromise,
    ]);

    if (tourResult.error) console.error('Error fetching tour chats:', tourResult.error);
    if (customResult.error) console.error('Error fetching custom chats:', customResult.error);

    const tourEntries: ChatEntry[] =
      (tourResult.data ?? []).map((row: any) => ({
        key: `tr:${row.id}`,
        id: row.id,
        kind: 'tour_request',
        title: row.route?.title || 'Tour',
        subtitle: (row.status as string).replace('_', ' '),
        sortKey: row.created_at,
      })) ?? [];

    const customEntries: ChatEntry[] =
      (customResult.data ?? []).map((row: any) => ({
        key: `cr:${row.id}`,
        id: row.id,
        kind: 'custom_route',
        title: 'Custom Tour',
        subtitle: row.places?.length > 48 ? `${row.places.slice(0, 48)}…` : row.places ?? '',
        sortKey: row.created_at,
      })) ?? [];

    const merged = [...tourEntries, ...customEntries].sort((a, b) =>
      a.sortKey < b.sortKey ? 1 : -1,
    );

    setChats(merged);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats]),
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border(theme) }]}>
        <Text style={[typography.labelS, { color: theme.textTertiary }]}>Tourpass</Text>
        <Text style={[typography.displayM, { color: theme.text, marginTop: spacing.xs }]}>Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={32} color={theme.textTertiary} />
          <Text style={[typography.bodyM, { color: theme.textTertiary, marginTop: spacing.md, textAlign: 'center' }]}>
            No active tours yet.{'\n'}Request a tour to start chatting.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              onPress={() =>
                router.push(
                  item.kind === 'custom_route'
                    ? (`/message/${item.id}?type=custom` as never)
                    : (`/message/${item.id}` as never),
                )
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRow({ item, onPress }: { item: ChatEntry; onPress: () => void }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.chatRow,
        {
          borderBottomColor: border(theme, pressed),
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.chatContent}>
        <Text style={[typography.headingS, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text
          style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
    </Pressable>
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
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  chatContent: { flex: 1 },
});

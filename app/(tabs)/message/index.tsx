import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function MessageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('tour_requests')
        .select('id, status, route:route_id (title, city)')
        .or(`tourist_id.eq.${user.id},guide_id.eq.${user.id}`)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching chats:', error);
      else setChats(data || []);
      setLoading(false);
    };
    fetchChats();
  }, [user]);

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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ChatRow item={item} onPress={() => router.push(`/message/${item.id}`)} />}
        />
      )}
    </SafeAreaView>
  );
}

function ChatRow({ item, onPress }: { item: any; onPress: () => void }) {
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
          {item.route?.title || 'Custom Tour'}
        </Text>
        <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
          {item.status.replace('_', ' ')}
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

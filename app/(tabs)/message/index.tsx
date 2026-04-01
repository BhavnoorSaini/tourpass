import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

interface ChatRow {
  id: string;
  status: string;
  route: {
    title: string | null;
    city: string | null;
  }[] | null;
}

export default function MessageScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchChats = async () => {
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
        console.error('Error fetching chats:', error);
      } else {
        setChats(((data as unknown) as ChatRow[]) || []);
      }
      setLoading(false);
    };

    void fetchChats();
  }, [user]);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="eyebrow">Messages</AppText>
        <AppText variant="display" style={styles.headerTitle}>
          Every accepted walk opens a thread here.
        </AppText>
        <AppText variant="body">
          Keep the coordination close, simple, and easy to scan.
        </AppText>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.centered}>
          <AppText variant="sectionTitle">No active conversations</AppText>
          <AppText variant="body" style={styles.emptyCopy}>
            Request a route or accept a walk to start a chat.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/message/${item.id}`)}
              style={styles.rowPressable}
            >
              <AppSurface style={styles.rowSurface}>
                <View style={styles.rowTop}>
                  <View style={styles.rowBadge}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.textPrimary} />
                  </View>
                  <AppText variant="mono">{item.status.replace('_', ' ')}</AppText>
                </View>

                <AppText variant="title" style={styles.rowTitle}>
                  {item.route?.[0]?.title || 'Custom tour'}
                </AppText>
                <AppText variant="caption">
                  {item.route?.[0]?.city || 'Tourpass conversation'}
                </AppText>

                <AccentLine active />
              </AppSurface>
            </Pressable>
          )}
        />
      )}
    </AppScreen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: theme.spacing.sm,
    },
    header: {
      marginBottom: theme.spacing.lg,
      maxWidth: 360,
    },
    headerTitle: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    centered: {
      minHeight: 260,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCopy: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
      maxWidth: 280,
    },
    list: {
      gap: theme.spacing.xs,
    },
    rowPressable: {
      marginBottom: theme.spacing.xs,
    },
    rowSurface: {
      padding: theme.spacing.sm,
      position: 'relative',
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    rowBadge: {
      width: 28,
      height: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTitle: {
      marginBottom: 4,
    },
  });

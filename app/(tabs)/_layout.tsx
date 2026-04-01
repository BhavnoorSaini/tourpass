import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/AppThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  label,
  icon,
  focused,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? icon : `${icon.replace('-outline', '')}-outline` as IconName}
        size={18}
        color={focused ? theme.colors.textPrimary : theme.colors.textMuted}
      />
      <AppText
        variant="label"
        color={focused ? theme.colors.textPrimary : theme.colors.textMuted}
        style={styles.tabLabel}
      >
        {label}
      </AppText>
      <AccentLine active={focused} inset={10} />
    </View>
  );
}

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  const { theme } = useAppTheme();

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarStyle: {
          height: theme.layout.tabBarHeight,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="compass-outline" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore-routes/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="search-outline" label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="message/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="chatbubble-ellipses-outline" label="Messages" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person-outline" label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    minWidth: 70,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 12,
  },
});

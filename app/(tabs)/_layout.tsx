import React from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/providers/AuthProvider';
import { FLOATING_TAB_BAR_HEIGHT, getFloatingTabBarBottom } from '@/constants/navigation';
import { border, darkTheme, lightTheme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/constants/spacing';

// Tab icon names mapped to Ionicons
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  home: { active: 'compass', inactive: 'compass-outline' },
  'message/index': { active: 'chatbubble', inactive: 'chatbubble-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const isDark = scheme === 'dark';

  return (
    <View pointerEvents="box-none" style={styles.tabBarFrame}>
      <View
        style={[
          styles.tabBar,
          {
            bottom: getFloatingTabBarBottom(insets.bottom),
            backgroundColor: theme.overlayBackground,
            borderColor: border(theme),
            shadowColor: isDark ? '#000000' : '#1A1916',
            shadowOpacity: isDark ? 0.38 : 0.14,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.iconShell,
                  focused && {
                    backgroundColor: theme.accent,
                    borderColor: isDark ? 'rgba(255, 247, 237, 0.16)' : 'rgba(26, 25, 22, 0.04)',
                  },
                ]}
              >
                <Ionicons
                  name={focused ? icons.active : icons.inactive}
                  size={21}
                  color={focused ? theme.accentText : theme.textSecondary}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, initializing } = useAuth();

  if (initializing) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="message/index" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  tabBar: {
    width: '80%',
    maxWidth: 340,
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderTopWidth: 1,
    elevation: 0,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShell: {
    minWidth: 48,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

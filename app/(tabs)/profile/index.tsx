import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { fetchProfileStats, type ProfileStats } from '@/lib/profile-activity';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { PressableButton } from '@/components/ui/PressableButton';
import { RequestStatusList } from '@/components/profile/RequestStatusList';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  is_guide: boolean | null;
  application_status: string | null;
  avatar_url: string | null;
}

const AVATAR_BUCKET = 'avatars';
const EMPTY_STATS: ProfileStats = {
  toursTaken: 0,
  citiesVisited: 0,
};

function hasPhotoLibraryAccess(permission: ImagePicker.MediaLibraryPermissionResponse) {
  return (
    permission.granted ||
    permission.accessPrivileges === 'all' ||
    permission.accessPrivileges === 'limited'
  );
}

function openAppSettings() {
  Linking.openSettings().catch(() => {
    Alert.alert('Settings Unavailable', 'Open your device settings to allow photo library access.');
  });
}

function getPhotoExtension(asset: ImagePicker.ImagePickerAsset) {
  const fileNameExtension = asset.fileName?.split('.').pop()?.toLowerCase();
  if (fileNameExtension) return fileNameExtension;

  const mimeExtension = asset.mimeType?.split('/').pop()?.toLowerCase();
  if (mimeExtension === 'jpeg') return 'jpg';
  return mimeExtension || 'jpg';
}

function NavRow({ icon, label, onPress, isLast = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; isLast?: boolean }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.navRow,
        {
          backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={[typography.bodyM, { color: theme.text, flex: 1, marginLeft: spacing.md }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [profileResult, nextStats] = await Promise.all([
      supabase
        .from('profiles')
        .select('first_name, last_name, is_guide, application_status, avatar_url')
        .eq('id', user.id)
        .single(),
      fetchProfileStats(user.id),
    ]);

    if (!profileResult.error) setProfile(profileResult.data);
    setStats(nextStats);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const ensurePhotoLibraryPermission = useCallback(async () => {
    let currentPermission: ImagePicker.MediaLibraryPermissionResponse;
    try {
      currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync(false);
    } catch (error) {
      console.warn('Failed to read photo library permission', error);
      Alert.alert('Photo Access Needed', 'We could not check photo library access. Please try again.');
      return false;
    }

    if (hasPhotoLibraryAccess(currentPermission)) return true;

    if (!currentPermission.canAskAgain) {
      Alert.alert(
        'Photo Access Needed',
        'Allow photo library access in Settings to upload a profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAppSettings },
        ],
      );
      return false;
    }

    let requestedPermission: ImagePicker.MediaLibraryPermissionResponse;
    try {
      requestedPermission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
    } catch (error) {
      console.warn('Failed to request photo library permission', error);
      Alert.alert('Photo Access Needed', 'We could not request photo library access. Please try again.');
      return false;
    }

    if (hasPhotoLibraryAccess(requestedPermission)) return true;

    Alert.alert(
      'Photo Access Needed',
      'Allow photo library access to upload a profile picture.',
      requestedPermission.canAskAgain
        ? [{ text: 'OK', style: 'default' }]
        : [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ],
    );
    return false;
  }, []);

  const pickProfilePhoto = useCallback(async () => {
    if (!user || avatarUploading) return;

    const hasPermission = await ensurePhotoLibraryPermission();
    if (!hasPermission) return;

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.82,
      });
    } catch {
      Alert.alert('Photo Access Needed', 'We could not open your photo library. Please try again.');
      return;
    }

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const extension = getPhotoExtension(asset);
    const contentType = asset.mimeType || `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    const avatarPath = `${user.id}/avatar-${Date.now()}.${extension}`;

    setAvatarUploading(true);
    try {
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(avatarPath, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(avatarPath);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrlData.publicUrl,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setProfile((current) =>
        current
          ? {
              ...current,
              avatar_url: publicUrlData.publicUrl,
            }
          : current,
      );
    } catch (error: any) {
      Alert.alert('Upload Failed', error?.message || 'Could not upload your profile picture.');
    } finally {
      setAvatarUploading(false);
    }
  }, [avatarUploading, ensurePhotoLibraryPermission, user]);

  const showPhotoOptions = useCallback(async () => {
    if (!user || avatarUploading) return;

    Alert.alert('Profile Photo', 'Upload a new profile picture.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Upload Photo', onPress: pickProfilePhoto },
    ]);
  }, [avatarUploading, pickProfilePhoto, user]);

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Pressable onPress={() => router.push('/profile/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>

        <View style={styles.avatarBlock}>
          <Pressable
            onPress={showPhotoOptions}
            disabled={!user || avatarUploading}
            style={[styles.avatar, { backgroundColor: theme.surface }]}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={[typography.headingL, { color: theme.text }]}>{initials}</Text>
            )}
            <View style={[styles.avatarCamera, { backgroundColor: theme.accent }]}>
              <Ionicons name="camera" size={13} color={theme.accentText} />
            </View>
            {avatarUploading ? (
              <View style={styles.avatarUploadingOverlay}>
                <ActivityIndicator color={theme.accentText} />
              </View>
            ) : null}
          </Pressable>
          <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.md }]}>
            {fullName}
          </Text>
          <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.statsRow, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[typography.headingM, { color: theme.text }]}>{stats.toursTaken}</Text>
            <Text style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]}>Tours Taken</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.background }]} />
          <View style={styles.statItem}>
            <Text style={[typography.headingM, { color: theme.text }]}>{stats.citiesVisited}</Text>
            <Text style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]}>Cities</Text>
          </View>
        </View>

        {!profile?.is_guide && profile?.application_status === 'none' && (
          <View style={styles.guideJourney}>
            <View style={[styles.guideJourneyContent, { backgroundColor: theme.surface }]}>
              <View style={styles.guideTextSection}>
                <Text style={[typography.headingS, { color: theme.text }]}>
                  Share your city
                </Text>
                <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  Apply to become a guide and earn from your routes.
                </Text>
              </View>

              <PressableButton
                label="Apply"
                onPress={() => router.push('/profile/become-guide')}
                style={styles.guideStartBtnJoin}
                icon="arrow-forward"
              />
            </View>
          </View>
        )}

        {!profile?.is_guide && <RequestStatusList />}

        {profile?.is_guide && (
          <View
            style={[
              styles.guideCard,
              { backgroundColor: theme.surface },
            ]}
          >
            <View style={styles.guideCardContent}>
              <Text style={[typography.labelS, { color: theme.accent }]}>Guide dashboard</Text>
              <Text style={[typography.headingS, styles.guideCardTitle, { color: theme.text }]}>
                View your guide activity
              </Text>
              <Text style={[typography.bodyS, styles.guideCardMessage, { color: theme.textSecondary }]}>
                Create routes, manage requests, and get paid by users.
              </Text>
              <PressableButton
                label="Open Guide Dashboard"
                onPress={() => router.push('/profile/guide-dashboard')}
                style={styles.guideDashboardButton}
              />
            </View>
          </View>
        )}

        <View style={[styles.navSection, { backgroundColor: theme.surface }]}>
          {profile?.is_guide ? (
            <NavRow icon="card-outline" label="Guide Billing" onPress={() => router.push('/profile/payments')} />
          ) : null}
          <NavRow icon="options-outline" label="Preferences" onPress={() => router.push('/profile/preferences')} isLast />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  settingsBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  avatarBlock: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  avatarCamera: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  guideJourney: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  guideJourneyContent: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  guideTextSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  guideStartBtnJoin: {
    height: 40,
    minWidth: 80,
    paddingHorizontal: spacing.md,
  },
  guideCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardContent: {
    alignItems: 'center',
  },
  guideCardTitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  guideCardMessage: {
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
  },
  guideStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  guideStat: {
    minWidth: 92,
    alignItems: 'center',
  },
  guideDashboardButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  navSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
});

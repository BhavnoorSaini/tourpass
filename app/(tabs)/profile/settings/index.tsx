import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';

// ── Settings Group (iOS-like Inset Group) ──────────────────────────────────
function SettingsGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.groupContainer}>
      {label ? (
        <Text style={[typography.labelS, styles.groupLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.groupCard, { backgroundColor: theme.surface }]}>
        {children}
      </View>
    </View>
  );
}

// ── Settings row ───────────────────────────────────────────────────────────
function SettingsRow({ label, value, onPress, isLast = false, destructive = false }: { label: string; value?: string; onPress: () => void; isLast?: boolean; destructive?: boolean }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.settingsRow,
        {
          backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.background, // subtle contrast against surface
        },
      ]}
    >
      <Text style={[typography.bodyM, { color: destructive ? theme.destructive : theme.text, flex: 1 }]}>
        {label}
      </Text>
      <View style={styles.settingsRowRight}>
        {value ? <Text style={[typography.bodyS, { color: theme.textSecondary, marginRight: spacing.sm }]}>{value}</Text> : null}
        {!destructive && <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />}
      </View>
    </Pressable>
  );
}

function HeaderActionButton({
  label,
  onPress,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <PressableButton
      label={label}
      onPress={onPress}
      loading={loading}
      style={styles.headerAction}
    />
  );
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────
function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata) {
        setFirstName(user.user_metadata.first_name || '');
        setLastName(user.user_metadata.last_name || '');
      }
    });
  }, [visible]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { first_name: firstName.trim(), last_name: lastName.trim() } });
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Saved', 'Profile updated.'); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ScreenHeader
          title="Edit Profile"
          onBack={onClose}
          right={
            <HeaderActionButton label="Done" onPress={handleSave} loading={saving} />
          }
        />
        <View style={styles.modalContent}>
          <StyledTextInput label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <StyledTextInput label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        </View>
      </View>
    </Modal>
  );
}

// ── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (newPw !== confirmPw) { Alert.alert('Mismatch', 'Passwords do not match.'); return; }
    if (newPw.length < 6) { Alert.alert('Too short', 'Password must be at least 6 characters.'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Updated', 'Password updated.'); setNewPw(''); setConfirmPw(''); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ScreenHeader
          title="Security"
          onBack={onClose}
          right={
            <HeaderActionButton label="Update" onPress={handleUpdate} loading={saving} />
          }
        />
        <View style={styles.modalContent}>
          <StyledTextInput label="New password" value={newPw} onChangeText={setNewPw} secureTextEntry />
          <StyledTextInput label="Confirm password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry />
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || 'Guest');
      setLoading(false);
    });
  }, [showProfileModal]);

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This will permanently delete your account. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No active user.');
              const { error } = await supabase.from('profiles').delete().eq('id', user.id);
              if (error) throw error;
              await supabase.auth.signOut();
              router.replace('/');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete profile.');
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <EditProfileModal visible={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <ChangePasswordModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>

        <SettingsGroup label="Account">
          <SettingsRow label="Edit Profile" onPress={() => setShowProfileModal(true)} />
          <SettingsRow label="Change Password" onPress={() => setShowPasswordModal(true)} isLast />
        </SettingsGroup>

        <SettingsGroup label="System">
          <SettingsRow label="Data & Privacy" onPress={() => router.push('/profile/settings/data-privacy')} isLast />
        </SettingsGroup>

        <SettingsGroup label="About">
          <SettingsRow label="Version" value="2.4.0" onPress={() => {}} isLast />
        </SettingsGroup>

        <View style={styles.footer}>
          <PressableButton label="Sign out" onPress={() => supabase.auth.signOut()} variant="ghost" style={styles.signOutBtn} />
          <PressableButton label="Delete Account" onPress={handleDeleteProfile} variant="destructive" style={styles.deleteBtn} />
          
          <Text style={[typography.bodyS, { color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xl }]}>
            Logged in as {userEmail}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  groupContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  groupLabel: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  groupCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center' },
  modal: { flex: 1 },
  modalContent: { padding: spacing.lg, marginTop: spacing.md },
  headerAction: {
    minWidth: 92,
    height: 40,
    paddingHorizontal: spacing.md,
  },
  footer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  signOutBtn: {
    height: 48,
  },
  deleteBtn: {
    height: 48,
  },
});

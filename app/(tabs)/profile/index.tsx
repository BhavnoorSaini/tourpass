import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  ActionRow,
  AnimatedEntrance,
  GlassPanel,
  PillButton,
  SectionHeading,
} from "@/components/profile/ProfilePrimitives";

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  is_guide: boolean | null;
  application_status: string | null;
}

const SCREEN_GRADIENT = ["#030712", "#07101C", "#02050B"] as const;
const HERO_GLASS = [
  "rgba(255, 255, 255, 0.12)",
  "rgba(255, 255, 255, 0.03)",
] as const;
const SURFACE_GLASS = [
  "rgba(255, 255, 255, 0.08)",
  "rgba(255, 255, 255, 0.02)",
] as const;
const GUIDE_GLASS = [
  "rgba(171, 196, 255, 0.14)",
  "rgba(255, 255, 255, 0.03)",
] as const;

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "New";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function getGuideState(
  isGuide: boolean | null | undefined,
  applicationStatus: string | null | undefined,
  loadingProfile: boolean
) {
  if (loadingProfile) return "Checking";
  if (isGuide) return "Approved";
  if (applicationStatus === "pending") return "Pending";
  return "Available";
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoadingProfile(false);
        }
        return;
      }

      setLoadingProfile(true);
      setProfileError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, is_guide, application_status")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (error) {
        setProfile(null);
        setProfileError(error.message);
      } else {
        setProfile(data);
      }

      setLoadingProfile(false);
    }

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isGuide = Boolean(profile?.is_guide);
  const applicationStatus = profile?.application_status ?? null;
  const firstName = user?.user_metadata?.first_name ?? profile?.first_name ?? "Tour";
  const lastName = user?.user_metadata?.last_name ?? profile?.last_name ?? "Pass";
  const displayName = useMemo(
    () => [firstName, lastName].filter(Boolean).join(" ").trim(),
    [firstName, lastName]
  );
  const roleLabel = isGuide ? "Guide" : "Traveler";
  const guideState = getGuideState(isGuide, applicationStatus, loadingProfile);
  const memberSince = formatMemberSince(user?.created_at);
  const contentWidth = useMemo(() => Math.min(width - 32, 548), [width]);
  const compactLayout = width < 410;
  const avatarUri = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName || "Tour Pass"
      )}&background=0B1220&color=F8FAFC&size=256&font-size=0.38`,
    [displayName]
  );

  const handleRoute = useCallback((href: string) => {
    void Haptics.selectionAsync();
    router.push(href as never);
  }, [router]);

  const handlePhotoPress = useCallback(() => {
    void Haptics.selectionAsync();
    Alert.alert("Profile photo", "Photo upload can be connected here.");
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await signOut();
    } catch (error) {
      Alert.alert(
        "Unable to sign out",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  const confirmSignOut = useCallback(() => {
    Alert.alert("Sign out", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void handleSignOut();
        },
      },
    ]);
  }, [handleSignOut]);

  const quickAction = useMemo(
    () =>
      isGuide
        ? {
            label: "Dashboard",
            icon: "grid-outline" as const,
            route: "/profile/guide-dashboard",
          }
        : applicationStatus === "pending"
          ? {
              label: "Support",
              icon: "help-buoy-outline" as const,
              route: "/profile/help-center",
            }
          : {
              label: "Apply",
              icon: "sparkles-outline" as const,
              route: "/profile/become-guide",
            },
    [applicationStatus, isGuide]
  );

  if (!user) {
    return null;
  }

  const renderGuidePanel = () => {
    if (loadingProfile) {
      return (
        <GlassPanel
          style={styles.sectionPanel}
          contentStyle={styles.loadingContent}
          intensity={22}
          gradientColors={SURFACE_GLASS}
        >
          <ActivityIndicator color="#F4E7CF" />
          <Text style={styles.loadingText}>Loading access</Text>
        </GlassPanel>
      );
    }

    if (isGuide) {
      return (
        <GlassPanel
          style={styles.sectionPanel}
          contentStyle={styles.guidePanelContent}
          intensity={32}
          gradientColors={GUIDE_GLASS}
        >
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>Guide workspace</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Active</Text>
            </View>
          </View>

          <Text style={styles.panelNote}>Manage tours and public profile.</Text>

          <View
            style={[
              styles.panelActions,
              compactLayout && styles.panelActionsCompact,
            ]}
          >
            <PillButton
              label="Dashboard"
              icon="grid-outline"
              onPress={() => handleRoute("/profile/guide-dashboard")}
              style={styles.flexButton}
            />
            <PillButton
              label="Edit guide profile"
              icon="create-outline"
              onPress={() => handleRoute("/profile/guide-profile")}
              variant="secondary"
              style={styles.flexButton}
            />
          </View>
        </GlassPanel>
      );
    }

    if (applicationStatus === "pending") {
      return (
        <GlassPanel
          style={styles.sectionPanel}
          contentStyle={styles.guidePanelContent}
          intensity={30}
          gradientColors={GUIDE_GLASS}
        >
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>Guide application</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Pending</Text>
            </View>
          </View>

          <Text style={styles.panelNote}>We&apos;re reviewing your application.</Text>

          <PillButton
            label="Help center"
            icon="help-buoy-outline"
            onPress={() => handleRoute("/profile/help-center")}
            variant="secondary"
            style={styles.singleButton}
          />
        </GlassPanel>
      );
    }

    return (
      <GlassPanel
        style={styles.sectionPanel}
        contentStyle={styles.guidePanelContent}
        intensity={30}
        gradientColors={GUIDE_GLASS}
      >
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>Become a guide</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Open</Text>
          </View>
        </View>

        <Text style={styles.panelNote}>Create tours and manage bookings.</Text>

        <PillButton
          label="Start application"
          icon="arrow-forward"
          onPress={() => handleRoute("/profile/become-guide")}
          style={styles.singleButton}
        />
      </GlassPanel>
    );
  };

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.glowPrimary} pointerEvents="none" />
      <View style={styles.glowSecondary} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <AnimatedEntrance>
              <View style={styles.topBar}>
                <Text style={styles.topTitle}>Profile</Text>

                <Pressable
                  accessibilityLabel="Open settings"
                  onPress={() => handleRoute("/profile/settings")}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <Ionicons name="settings-outline" size={20} color="#F8FAFC" />
                </Pressable>
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={70}>
              <GlassPanel
                style={styles.heroPanel}
                contentStyle={styles.heroPanelContent}
                intensity={38}
                gradientColors={HERO_GLASS}
              >
                <View
                  style={[
                    styles.heroIdentity,
                    compactLayout && styles.heroIdentityCompact,
                  ]}
                >
                  <View style={styles.avatarShell}>
                    <Image source={avatarUri} style={styles.avatar} contentFit="cover" />
                    <Pressable
                      accessibilityLabel="Edit profile photo"
                      onPress={handlePhotoPress}
                      style={({ pressed }) => [
                        styles.cameraButton,
                        pressed && styles.cameraButtonPressed,
                      ]}
                    >
                      <Ionicons name="camera" size={14} color="#091220" />
                    </Pressable>
                  </View>

                  <View style={styles.identityText}>
                    <Text
                      numberOfLines={compactLayout ? 2 : 1}
                      style={styles.displayName}
                    >
                      {displayName}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      style={styles.emailText}
                    >
                      {user.email}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>{roleLabel}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>{guideState}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>{memberSince}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.heroActions,
                    compactLayout && styles.heroActionsCompact,
                  ]}
                >
                  <PillButton
                    label="Edit profile"
                    icon="create-outline"
                    onPress={() => handleRoute("/profile/settings")}
                    style={styles.flexButton}
                  />
                  <PillButton
                    label={quickAction.label}
                    icon={quickAction.icon}
                    onPress={() => handleRoute(quickAction.route)}
                    variant="secondary"
                    style={styles.flexButton}
                  />
                </View>
              </GlassPanel>
            </AnimatedEntrance>

            {profileError ? (
              <AnimatedEntrance delay={110}>
                <GlassPanel
                  style={styles.noticePanel}
                  contentStyle={styles.noticePanelContent}
                  intensity={18}
                  gradientColors={SURFACE_GLASS}
                >
                  <Ionicons name="alert-circle-outline" size={16} color="#FBCACA" />
                  <Text style={styles.noticeText}>Some profile details are unavailable.</Text>
                </GlassPanel>
              </AnimatedEntrance>
            ) : null}

            <AnimatedEntrance delay={160}>
              <View style={styles.section}>
                <SectionHeading title="Guide" />
                {renderGuidePanel()}
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={220}>
              <View style={styles.section}>
                <SectionHeading title="Manage" />
                <GlassPanel
                  style={styles.sectionPanel}
                  contentStyle={styles.groupPanelContent}
                  intensity={24}
                  gradientColors={SURFACE_GLASS}
                >
                  <ActionRow
                    icon="card-outline"
                    label="Payments"
                    iconTint="#F4E7CF"
                    onPress={() => handleRoute("/profile/payments")}
                  />
                  <View style={styles.divider} />
                  <ActionRow
                    icon="options-outline"
                    label="Preferences"
                    iconTint="#BAE6FD"
                    onPress={() => handleRoute("/profile/preferences")}
                  />
                </GlassPanel>
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={280}>
              <View style={styles.section}>
                <SectionHeading title="Support" />
                <GlassPanel
                  style={styles.sectionPanel}
                  contentStyle={styles.groupPanelContent}
                  intensity={24}
                  gradientColors={SURFACE_GLASS}
                >
                  <ActionRow
                    icon="help-buoy-outline"
                    label="Help center"
                    iconTint="#F9C48B"
                    onPress={() => handleRoute("/profile/help-center")}
                  />
                </GlassPanel>
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={340}>
              <View style={styles.section}>
                <SectionHeading title="Session" />
                <GlassPanel
                  style={styles.sectionPanel}
                  contentStyle={styles.groupPanelContent}
                  intensity={24}
                  gradientColors={SURFACE_GLASS}
                >
                  <ActionRow
                    icon="log-out-outline"
                    label={isSigningOut ? "Signing out..." : "Sign out"}
                    iconTint="#FCA5A5"
                    destructive
                    hideChevron
                    onPress={confirmSignOut}
                  />
                </GlassPanel>
              </View>
            </AnimatedEntrance>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 132,
  },
  content: {
    alignSelf: "center",
  },
  topBar: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: 0.15,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  iconButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  heroPanel: {
    borderRadius: 30,
  },
  heroPanelContent: {
    padding: 22,
    gap: 18,
  },
  heroIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroIdentityCompact: {
    alignItems: "flex-start",
  },
  avatarShell: {
    width: 86,
    height: 86,
    borderRadius: 28,
    padding: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  cameraButton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 231, 207, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cameraButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  identityText: {
    flex: 1,
    gap: 5,
  },
  displayName: {
    color: "#F8FAFC",
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: 0.15,
  },
  emailText: {
    color: "#C7D2E0",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  metaChipText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroActionsCompact: {
    flexDirection: "column",
  },
  flexButton: {
    flex: 1,
  },
  singleButton: {
    alignSelf: "flex-start",
  },
  noticePanel: {
    marginTop: 14,
  },
  noticePanelContent: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: "#FBD5D5",
    fontSize: 13,
  },
  section: {
    marginTop: 22,
  },
  sectionPanel: {
    borderRadius: 26,
  },
  loadingContent: {
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#A5B4C7",
    fontSize: 13,
    fontWeight: "500",
  },
  guidePanelContent: {
    padding: 20,
    gap: 12,
  },
  panelHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 27,
    letterSpacing: 0.15,
  },
  panelNote: {
    color: "#A5B4C7",
    fontSize: 13,
    lineHeight: 19,
  },
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(244, 231, 207, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(244, 231, 207, 0.18)",
  },
  statusBadgeText: {
    color: "#F4E7CF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  panelActions: {
    flexDirection: "row",
    gap: 10,
  },
  panelActionsCompact: {
    flexDirection: "column",
  },
  groupPanelContent: {
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  glowPrimary: {
    position: "absolute",
    top: -110,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(147, 197, 253, 0.16)",
  },
  glowSecondary: {
    position: "absolute",
    top: 170,
    left: -110,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(244, 231, 207, 0.08)",
  },
});

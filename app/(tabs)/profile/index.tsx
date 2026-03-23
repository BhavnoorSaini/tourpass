import { useEffect, useState } from "react";
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
  PillButton,
  SectionHeading,
  StatPill,
} from "@/components/profile/ProfilePrimitives";

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  is_guide: boolean | null;
  application_status: string | null;
}

const SCREEN_GRADIENT = ["#07111F", "#09172A", "#02060D"] as const;
const HERO_GRADIENT = ["#1C3355", "#11203A", "#0A1424"] as const;
const GUIDE_GRADIENT = ["#16253C", "#0D1829", "#09111D"] as const;

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "New";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function getGuideLabel(
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

  if (!user) {
    return null;
  }

  const isGuide = Boolean(profile?.is_guide);
  const applicationStatus = profile?.application_status ?? null;
  const firstName =
    user.user_metadata?.first_name ??
    profile?.first_name ??
    "Tour";
  const lastName =
    user.user_metadata?.last_name ??
    profile?.last_name ??
    "Pass";
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const roleLabel = isGuide ? "Guide" : "Traveler";
  const guideLabel = getGuideLabel(isGuide, applicationStatus, loadingProfile);
  const memberSince = formatMemberSince(user.created_at);
  const contentWidth = Math.min(width - 24, 560);
  const compactActions = width < 390;
  const avatarUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName || "Tour Pass"
  )}&background=0B1220&color=F8FAFC&size=256&font-size=0.38`;

  const handleRoute = (href: string) => {
    void Haptics.selectionAsync();
    router.push(href as never);
  };

  const handlePhotoPress = () => {
    void Haptics.selectionAsync();
    Alert.alert(
      "Profile photo",
      "This is a good spot to plug in your image upload flow when you're ready."
    );
  };

  const confirmSignOut = () => {
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
  };

  const handleSignOut = async () => {
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
  };

  const renderGuidePanel = () => {
    if (loadingProfile) {
      return (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#F5B942" />
          <Text style={styles.loadingText}>Loading guide access…</Text>
        </View>
      );
    }

    if (isGuide) {
      return (
        <LinearGradient colors={GUIDE_GRADIENT} style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <View style={styles.guideBadge}>
              <Ionicons name="compass" size={16} color="#F5B942" />
              <Text style={styles.guideBadgeText}>Guide access active</Text>
            </View>
          </View>

          <Text style={styles.guideTitle}>Guide workspace</Text>
          <Text style={styles.guideDescription}>
            Keep your public profile sharp and jump into your dashboard to manage
            tours, revenue, and upcoming guests.
          </Text>

          <View
            style={[
              styles.guideActions,
              compactActions && styles.guideActionsCompact,
            ]}
          >
            <PillButton
              label="Dashboard"
              icon="grid"
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
        </LinearGradient>
      );
    }

    if (applicationStatus === "pending") {
      return (
        <LinearGradient colors={GUIDE_GRADIENT} style={styles.guideCard}>
          <View style={styles.guideBadge}>
            <Ionicons name="time-outline" size={16} color="#F5B942" />
            <Text style={styles.guideBadgeText}>Application in review</Text>
          </View>

          <Text style={styles.guideTitle}>You&apos;re in the queue</Text>
          <Text style={styles.guideDescription}>
            Your guide application is under review. We&apos;ll notify you as soon
            as your account is approved.
          </Text>

          <PillButton
            label="Help center"
            icon="help-buoy-outline"
            onPress={() => handleRoute("/profile/help-center")}
            variant="secondary"
            style={styles.singleButton}
          />
        </LinearGradient>
      );
    }

    return (
      <LinearGradient colors={GUIDE_GRADIENT} style={styles.guideCard}>
        <View style={styles.guideBadge}>
          <Ionicons name="sparkles-outline" size={16} color="#F5B942" />
          <Text style={styles.guideBadgeText}>Open to apply</Text>
        </View>

        <Text style={styles.guideTitle}>Become a Tour Guide</Text>
        <Text style={styles.guideDescription}>
          Turn your city knowledge into memorable experiences with a polished
          guide profile and your own dashboard.
        </Text>

        <PillButton
          label="Start application"
          icon="arrow-forward"
          onPress={() => handleRoute("/profile/become-guide")}
          style={styles.singleButton}
        />
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.glowOne} pointerEvents="none" />
      <View style={styles.glowTwo} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <AnimatedEntrance>
              <View style={styles.topBar}>
                <View>
                  <Text style={styles.eyebrow}>Account</Text>
                  <Text style={styles.topTitle}>Profile</Text>
                </View>

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

            <AnimatedEntrance delay={80}>
              <LinearGradient colors={HERO_GRADIENT} style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.identityWrap}>
                    <View style={styles.avatarFrame}>
                      <Image source={avatarUri} style={styles.avatar} contentFit="cover" />
                      <Pressable
                        accessibilityLabel="Edit profile photo"
                        onPress={handlePhotoPress}
                        style={({ pressed }) => [
                          styles.cameraButton,
                          pressed && styles.cameraButtonPressed,
                        ]}
                      >
                        <Ionicons name="camera" size={14} color="#06111F" />
                      </Pressable>
                    </View>

                    <View style={styles.identityText}>
                      <View style={styles.nameRow}>
                        <Text style={styles.displayName}>{displayName}</Text>
                        <View style={styles.roleChip}>
                          <Text style={styles.roleChipText}>{roleLabel}</Text>
                        </View>
                      </View>

                      <Text style={styles.emailText}>{user.email}</Text>
                      <Text style={styles.supportingText}>
                        Manage your profile, preferences, payments, and guide access
                        from one place.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.heroButtons,
                      compactActions && styles.heroButtonsCompact,
                    ]}
                  >
                    <PillButton
                      label="Edit profile"
                      icon="create-outline"
                      onPress={() => handleRoute("/profile/settings")}
                      style={styles.flexButton}
                    />
                    <PillButton
                      label="Preferences"
                      icon="options-outline"
                      onPress={() => handleRoute("/profile/preferences")}
                      variant="secondary"
                      style={styles.flexButton}
                    />
                  </View>
                </View>

                <View style={styles.statGrid}>
                  <StatPill label="Role" value={roleLabel} />
                  <StatPill label="Guide status" value={guideLabel} />
                  <StatPill label="Member since" value={memberSince} />
                </View>
              </LinearGradient>
            </AnimatedEntrance>

            {profileError ? (
              <AnimatedEntrance delay={120}>
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FCA5A5" />
                  <Text style={styles.errorText}>
                    Some profile details could not be loaded right now.
                  </Text>
                </View>
              </AnimatedEntrance>
            ) : null}

            <AnimatedEntrance delay={160}>
              <View style={styles.section}>
                <SectionHeading
                  title="Profile info"
                  caption="Identity controls and account-level edits."
                />

                <View style={styles.surface}>
                  <ActionRow
                    icon="person-circle-outline"
                    label="Edit account details"
                    subtitle="Update your name and account information."
                    iconTint="#7DD3FC"
                    onPress={() => handleRoute("/profile/settings")}
                  />
                  <View style={styles.divider} />
                  <ActionRow
                    icon="camera-outline"
                    label="Change profile photo"
                    subtitle="Add a fresh avatar when your upload flow is ready."
                    iconTint="#C4B5FD"
                    onPress={handlePhotoPress}
                  />
                </View>
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={220}>
              <View style={styles.section}>
                <SectionHeading
                  title="Guide"
                  caption="Everything related to hosting and guide access."
                />
                {renderGuidePanel()}
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={280}>
              <View style={styles.section}>
                <SectionHeading
                  title="Settings"
                  caption="Billing, preferences, and support tools."
                />

                <View style={styles.surface}>
                  <ActionRow
                    icon="settings-outline"
                    label="Settings"
                    subtitle="Security, password, and profile management."
                    iconTint="#93C5FD"
                    onPress={() => handleRoute("/profile/settings")}
                  />
                  <View style={styles.divider} />
                  <ActionRow
                    icon="card-outline"
                    label="Payments"
                    subtitle="Manage your payout and payment details."
                    iconTint="#F5B942"
                    onPress={() => handleRoute("/profile/payments")}
                  />
                  <View style={styles.divider} />
                  <ActionRow
                    icon="options-outline"
                    label="Preferences"
                    subtitle="Tune alerts, app behavior, and personal defaults."
                    iconTint="#A7F3D0"
                    onPress={() => handleRoute("/profile/preferences")}
                  />
                  <View style={styles.divider} />
                  <ActionRow
                    icon="help-buoy-outline"
                    label="Help center"
                    subtitle="Get support, report bugs, or review FAQs."
                    iconTint="#FDBA74"
                    onPress={() => handleRoute("/profile/help-center")}
                  />
                </View>
              </View>
            </AnimatedEntrance>

            <AnimatedEntrance delay={340}>
              <View style={styles.section}>
                <SectionHeading
                  title="Actions"
                  caption="Secure account actions and session controls."
                />

                <View style={styles.surface}>
                  <ActionRow
                    icon="log-out-outline"
                    label={isSigningOut ? "Signing out..." : "Sign out"}
                    subtitle="End your current session on this device."
                    iconTint="#F87171"
                    destructive
                    hideChevron
                    onPress={confirmSignOut}
                  />
                </View>
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
    paddingBottom: 132,
  },
  content: {
    alignSelf: "center",
    paddingTop: 10,
  },
  topBar: {
    marginBottom: 18,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  topTitle: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  iconButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    shadowColor: "#020617",
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  heroTopRow: {
    gap: 22,
  },
  identityWrap: {
    flexDirection: "row",
    gap: 16,
  },
  avatarFrame: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  cameraButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5B942",
    borderWidth: 2,
    borderColor: "#10203B",
  },
  cameraButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  identityText: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  displayName: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(125, 211, 252, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.24)",
  },
  roleChipText: {
    color: "#C9EEFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  emailText: {
    color: "#D9E4F2",
    fontSize: 14,
    fontWeight: "500",
  },
  supportingText: {
    color: "#9FB0C4",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 420,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 10,
  },
  heroButtonsCompact: {
    flexDirection: "column",
  },
  flexButton: {
    flex: 1,
  },
  singleButton: {
    alignSelf: "flex-start",
  },
  statGrid: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: {
    marginTop: 24,
  },
  surface: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(10, 18, 31, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    shadowColor: "#020617",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 74,
    backgroundColor: "rgba(148, 163, 184, 0.16)",
  },
  guideCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    shadowColor: "#020617",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  guideHeader: {
    marginBottom: 6,
  },
  guideBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(245, 185, 66, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.16)",
  },
  guideBadgeText: {
    color: "#F8D993",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  guideTitle: {
    marginTop: 16,
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  guideDescription: {
    marginTop: 10,
    color: "#A3B4C8",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 460,
  },
  guideActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  guideActionsCompact: {
    flexDirection: "column",
  },
  loadingCard: {
    minHeight: 138,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(10, 18, 31, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  errorBanner: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(127, 29, 29, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
  },
  errorText: {
    color: "#FECACA",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  glowOne: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
  },
  glowTwo: {
    position: "absolute",
    top: 120,
    left: -120,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(245, 185, 66, 0.09)",
  },
});

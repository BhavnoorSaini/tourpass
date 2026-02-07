import { Text, View, Pressable, Alert, ActivityIndicator, Image } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRouter, Href } from 'expo-router';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from "@callstack/liquid-glass";

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert("Logout failed", err.message ?? "Unknown error");
    }
  };

  if (!user) {
    return null;
  }
  //this is the profile screen layout
  return (
      <View className="flex-1 items-center bg-[#0B1D3A]">
        {/* Settings button */}
          <Pressable
              className="absolute top-14 right-6 z-10"
              onPress={() => router.push(('/settings' as Href))}
          >
              <Ionicons name="settings-outline" size={26} color="white" />
          </Pressable>







          <View className="items-center mt-20">
          {/* Avatar wrapper */}
          <View className="relative">
            <Image
                source={{
                  uri:
                      "https://ui-avatars.com/api/?name=" +
                      (profile?.first_name ?? "User"),
                }}
                className="w-28 h-28 rounded-full border-4 border-white/30"
            />
            {/* Camera button */}
            <Pressable
                onPress={() =>
                    Alert.alert("Change Photo", "Upload profile picture")
                }
                className="absolute bottom-0 right-0 bg-indigo-500 w-9 h-9 rounded-full items-center justify-center border-2 border-[#0B1D3A]"
            >
              <Ionicons name="camera-outline" size={18} color="white" />
            </Pressable>
          </View>

          <Text className="text-white text-xl font-semibold mt-4">
            {[profile?.first_name, profile?.last_name]
                .filter(Boolean)
                .join(" ") || "Unknown User"}
          </Text>

          <Text className="text-white/70 mt-1">{user.email}</Text>
        </View>





        <LiquidGlassView
            effect="regular"
            tintColor="rgba(10, 20, 110, 0.35)"
            style={[
              {
                marginTop: 24,
                borderRadius: 20,
                paddingHorizontal: 24,
                paddingVertical: 16,
                width: "90%",
              },
              !isLiquidGlassSupported && {
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            ]}
        >
          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1">
              <Text className="text-white text-2xl font-bold">12</Text>
              <Text className="text-white/70 text-sm">Tours Taken</Text>
            </View>

            <View className="w-px h-10 bg-white/20" />

            <View className="items-center flex-1">
              <Text className="text-white text-2xl font-bold">5</Text>
              <Text className="text-white/70 text-sm">Cities Visited</Text>
            </View>
          </View>
        </LiquidGlassView>






        <Pressable
            onPress={() => {
              // later: router.push("/become-guide")
            }}
            className="mt-4 w-[90%] bg-indigo-500/90 rounded-2xl px-6 py-5">

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-semibold">
                Become a Tour Guide
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Share your city with others
              </Text>
            </View>

            <Text className="text-white text-xl">→</Text>
          </View>




        </Pressable>
        <View className="mt-6 w-[90%] gap-3">
          {/* Payments */}
          <Pressable>
            <LiquidGlassView
                effect="regular"
                tintColor="rgba(255,255,255,0.25) /* white */"
                style={[
                  {
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  },
                  !isLiquidGlassSupported && {
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                ]}
            >

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <Text className="text-xl">💳</Text>
                <Text className="text-white text-base font-medium">
                  Payments
                </Text>
              </View>
              <Text className="text-white/50 text-lg">›</Text>
            </View>
            </LiquidGlassView>
          </Pressable>



          {/* Preferences */}
          <Pressable>
            <LiquidGlassView
                effect="regular"
                tintColor="rgba(255,255,255,0.25) /* white */"
                style={[
                  {
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  },
                  !isLiquidGlassSupported && {
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                ]}
            >

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <Text className="text-xl">⚙️</Text>
                <Text className="text-white text-base font-medium">
                  Preferences
                </Text>
              </View>
              <Text className="text-white/50 text-lg">›</Text>
            </View>
            </LiquidGlassView>
          </Pressable>




          {/* Help Center */}
          <Pressable>
            <LiquidGlassView
                effect="regular"
                tintColor="rgba(255,255,255,0.25) /* white */"
                style={[
                  {
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  },
                  !isLiquidGlassSupported && {
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                ]}
            >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <Text className="text-xl">❓</Text>
                <Text className="text-white text-base font-medium">
                  Help Center
                </Text>
              </View>
              <Text className="text-white/50 text-lg">›</Text>
            </View>
            </LiquidGlassView>
          </Pressable>

        </View>
        {/* Middle spacer */}
        <View className="flex-1 items-center justify-center">
          {loadingProfile && <ActivityIndicator color="#fff" />}
          {profileError && (
              <Text className="text-red-400 text-center px-6">
                Failed to load profile: {profileError}
              </Text>
          )}
        </View>

        {/* Logout button */}
        <View className="items-center mb-10">
          <Pressable //MOVED TO BOTTOM CENTER
              className="bg-red-600 px-8 py-3 rounded-xl"
              onPress={handleLogout}
          >
            <Text className="text-white font-semibold text-base">
              Log out
            </Text>
          </Pressable>
        </View>
      </View>
  );

}
import { Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  return (
    <View className="flex-1 justify-center items-center gap-4">
      <Text className="text-red-500">Profile Page.</Text>
      <Text className="text-gray-700">Signed in as: {user.email}</Text>
      {loadingProfile && <ActivityIndicator />}
      {!loadingProfile && profile && (
        <Text className="text-gray-700">
          Name: {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unknown"}
        </Text>
      )}
      {profileError && (
        <Text className="text-red-600 text-center">Failed to load profile: {profileError}</Text>
      )}
      <Pressable
        className="bg-red-600 px-4 py-2 rounded"
        onPress={handleLogout}
      >
        <Text className="text-white font-semibold">Log out</Text>
      </Pressable>
    </View>
  );
}
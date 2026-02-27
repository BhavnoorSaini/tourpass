import { Text, View, Pressable, Alert, Image } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; // router is imported here
import { LinearGradient } from "expo-linear-gradient";



interface ProfileRow {
    first_name: string | null;
    last_name: string | null;
}

export default function Index() {
    const { user } = useAuth();
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


    return (
        <LinearGradient
            colors={["#0B1D3A", "#1E3A8A", "#4C1D95"]}
            style={{ flex: 1 }}
        >
            <View className="flex-1 items-center">
            {/* Settings button */}
            <Pressable
                className="absolute top-14 right-6 z-10"
                onPress={() => router.push("/profile/settings")}
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
            </View>

            <View
                style={{
                    marginTop: 24,
                    borderRadius: 20,
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    width: "90%",
                    backgroundColor: "rgba(255,255,255,0.12)",
                }}
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
            </View>




            <Pressable
                onPress={() => router.push("/profile/become-guide")}
                className="mt-4 w-[90%]"
            >
                <View
                    style={{
                        marginTop: 24,
                        borderRadius: 20,
                        paddingHorizontal: 24,
                        paddingVertical: 20,
                        width: "100%",
                        backgroundColor: "rgba(88,28,135,0.75)",
                    }}
                >
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
                </View>
            </Pressable>








            <View className="mt-6 w-[90%] gap-3">
                {/* === PAYMENTS BUTTON === */}
                <Pressable
                    onPress={() => router.push("/profile/payments")}
                    className="w-full"
                >
                    <View
                        className="flex-row items-center justify-between px-4 py-4 rounded-2xl"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.12)",
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="bg-white/15 p-2 rounded-xl">
                                <Text className="text-lg">💳</Text>
                            </View>
                            <Text className="text-white text-base font-medium">
                                Payments
                            </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
                    </View>
                </Pressable>



                {/* PREFERENCES BUTTON */}
                <Pressable
                    onPress={() => router.push("/profile/preferences")}
                    className="w-full"
                >
                    <View
                        className="flex-row items-center justify-between px-4 py-4 rounded-2xl"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.12)",
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="bg-white/15 p-2 rounded-xl">
                                <Text className="text-lg">⚙️</Text>
                            </View>
                            <Text className="text-white text-base font-medium">
                                Preferences
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="rgba(255,255,255,0.6)"
                        />
                    </View>
                </Pressable>



                {/* HELP CENTER BUTTON */}
                <Pressable
                    onPress={() => router.push("/profile/help-center")}
                    className="w-full"
                >
                    <View
                        className="flex-row items-center justify-between px-4 py-4 rounded-2xl"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.12)",
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="bg-white/15 p-2 rounded-xl">
                                <Text className="text-lg">❓</Text>
                            </View>
                            <Text className="text-white text-base font-medium">
                                Help Center
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="rgba(255,255,255,0.6)"
                        />
                    </View>
                </Pressable>


            </View>
            </View>
        </LinearGradient>
    );
}
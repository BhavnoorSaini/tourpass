import { Text, View, Pressable, Alert } from "react-native";
import { useAuth } from "@/providers/AuthProvider";

export default function Profile() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (err: any) {
            Alert.alert("Logout failed", err.message ?? "Unknown error");
        }
    };

    return (
        <View className="flex-1 justify-center items-center gap-4">
            <Text className="text-red-500">Profile Page.</Text>
            {user && <Text className="text-gray-700">Signed in as: {user.email}</Text>}
            <Pressable
                className="bg-red-600 px-4 py-2 rounded"
                onPress={handleLogout}
            >
                <Text className="text-white font-semibold">Log out</Text>
            </Pressable>
        </View>
    );
}
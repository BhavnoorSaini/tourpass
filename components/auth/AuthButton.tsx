import { Pressable, Text, ActivityIndicator } from 'react-native';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
}

export function AuthButton({ title, onPress, loading }: AuthButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={loading}
            className={`h-[56px] w-full rounded-2xl overflow-hidden justify-center items-center ${
                loading ? 'bg-[#0284C7]/70' : 'bg-[#0284C7]'
            }`}
            style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
        >
            {loading ? (
                <ActivityIndicator color="white" size="small" />
            ) : (
                <Text className="text-white font-bold text-lg tracking-wide">
                    {title}
                </Text>
            )}
        </Pressable>
    );
}
import {Pressable, Text, ActivityIndicator, View} from 'react-native';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
}

export function AuthButton({ title, onPress, loading }: AuthButtonProps) {
    return (
        <View
            style={{
                height: 48,
                borderRadius: 12,
                overflow: 'hidden',
                marginTop: 10,
                backgroundColor: '#4B0082',
            }}
        >
            <Pressable
                onPress={onPress}
                disabled={loading}
                style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-semibold text-lg">{title}</Text>
                )}
            </Pressable>
        </View>
    );
}
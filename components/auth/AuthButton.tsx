import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
}

export function AuthButton({ title, onPress, loading }: AuthButtonProps) {
    return (
        <LiquidGlassView
            style={{
                height: 48,
                borderRadius: 12,
                overflow: 'hidden',
                marginTop: 10,
            }}
            effect="regular"
            interactive
            tintColor="rgba(0, 122, 255, 0.5)"
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
        </LiquidGlassView>
    );
}
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

interface AuthInputProps extends TextInputProps {
    label: string;
}

export function AuthInput({ label, style, ...props }: AuthInputProps) {
    return (
        <View className="gap-2">
            <Text className="text-white/80">{label}</Text>
            <LiquidGlassView
                effect="regular"
                interactive
                tintColor="rgba(173,216,230,0.25)"
                style={{
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    height: 50,
                    justifyContent: 'center',
                }}
            >
                <TextInput
                    className="text-white h-full"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    {...props}
                />
            </LiquidGlassView>
        </View>
    );
}
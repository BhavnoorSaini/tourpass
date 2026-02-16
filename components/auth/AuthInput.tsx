import { View, Text, TextInput, TextInputProps } from 'react-native';

interface AuthInputProps extends TextInputProps {
    label: string;
}

export function AuthInput({ label, style, ...props }: AuthInputProps) {
    return (
        <View className="gap-2">
            <Text className="text-white/80">{label}</Text>
            <View
                className="h-[50px] rounded-xl px-4 py-4 justify-center bg-white/10 border border-white/20"
            >
                <TextInput
                    className="text-white h-full"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    {...props}
                />
            </View>
        </View>
    );
}
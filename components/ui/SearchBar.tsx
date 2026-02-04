import { View, TextInput } from 'react-native';
// A simple search bar component, pretty litty
export default function SearchBar({ onFocus }: { onFocus?: () => void }) {
    return (
        <View className="bg-white/90 rounded-xl px-3 py-3 shadow">
            <TextInput
                placeholder="Search for places"
                className="text-base"
                onFocus={onFocus}
            />
            <TextInput
                style={{
                    color: 'white',
                    fontSize: 16,
                }}
                placeholderTextColor="rgba(255,255,255,0.7)"
            />
        </View>

    );
}

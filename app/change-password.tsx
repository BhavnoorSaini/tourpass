import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ChangePassword() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            Alert.alert('Success', 'Your password has been updated.');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#111827] p-5">
            <Text className="text-white text-2xl font-bold mb-6 mt-4">Change Password</Text>

            {/* New Password */}
            <View className="mb-4">
                <Text className="text-gray-400 mb-2 ml-1 text-sm font-semibold">New Password</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="bg-[#1F2937] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                    placeholder="Enter new password"
                    placeholderTextColor="#6B7280"
                />
            </View>

            {/* Confirm Password */}
            <View className="mb-8">
                <Text className="text-gray-400 mb-2 ml-1 text-sm font-semibold">Confirm Password</Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    className="bg-[#1F2937] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                    placeholder="Re-enter new password"
                    placeholderTextColor="#6B7280"
                />
            </View>

            {/* Update Button */}
            <TouchableOpacity
                onPress={handleUpdatePassword}
                disabled={loading}
                className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-600' : 'bg-[#3B82F6]'}`}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Update Password</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="mt-4 items-center">
                <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
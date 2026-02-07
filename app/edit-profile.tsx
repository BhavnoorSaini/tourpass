import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State for fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Load initial data
    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');

                const meta = user.user_metadata || {};

                // 1. Check if we already have separate names
                if (meta.first_name) {
                    setFirstName(meta.first_name);
                    setLastName(meta.last_name || '');
                }
                // 2. If not, try to split the existing 'full_name' string
                else if (meta.full_name) {
                    const nameParts = meta.full_name.split(' ');
                    setFirstName(nameParts[0] || '');
                    setLastName(nameParts.slice(1).join(' ') || '');
                }
            }
        }
        getProfile();
    }, []);

    const handleUpdate = async () => {
        setLoading(true);
        try {

            const combinedName = `${firstName} ${lastName}`.trim();

            // 1. Prepare the updates
            const updates: any = {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: combinedName
                }
            };

            // 2. Check for email changes
            const { data: { user } } = await supabase.auth.getUser();
            if (email !== user?.email) {
                updates.email = email;
            }

            // 3. Send update to Supabase
            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            Alert.alert(
                'Success',
                updates.email
                    ? 'Profile updated! Please check your new email to confirm.'
                    : 'Profile updated successfully!'
            );

            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-[#111827]">
            <View className="p-5">
                <Text className="text-white text-2xl font-bold mb-6 mt-4">Edit Profile</Text>

                {/* First Name Input */}
                <View className="mb-4">
                    <Text className="text-gray-400 mb-2 ml-1 text-sm font-semibold">First Name</Text>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        className="bg-[#1F2937] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                        placeholder="First Name"
                        placeholderTextColor="#6B7280"
                    />
                </View>

                {/* Last Name Input */}
                <View className="mb-4">
                    <Text className="text-gray-400 mb-2 ml-1 text-sm font-semibold">Last Name</Text>
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        className="bg-[#1F2937] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                        placeholder="Last Name"
                        placeholderTextColor="#6B7280"
                    />
                </View>

                {/* Email Input */}
                <View className="mb-8">
                    <Text className="text-gray-400 mb-2 ml-1 text-sm font-semibold">Email Address</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="bg-[#1F2937] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                        placeholder="name@example.com"
                        placeholderTextColor="#6B7280"
                    />
                    <Text className="text-gray-500 text-xs mt-1 ml-1">
                        Changing this will require email re-confirmation.
                    </Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={loading}
                    className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-600' : 'bg-[#3B82F6]'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} className="mt-4 items-center mb-10">
                    <Text className="text-gray-500">Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
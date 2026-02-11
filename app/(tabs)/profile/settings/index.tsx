import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

// --- Interfaces ---
interface SettingsItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    label: string;
    value?: string;
    onPress: () => void;
    isDestructive?: boolean;
}

interface SectionHeaderProps {
    title: string;
}

interface ModalProps {
    visible: boolean;
    onClose: () => void;
}

// --- Reusable Components ---
const SettingsItem = ({ icon, iconColor, label, value, onPress, isDestructive = false }: SettingsItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between p-4 bg-[#1F2937] border-b border-gray-700 first:rounded-t-xl last:rounded-b-xl last:border-b-0"
    >
        <View className="flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${iconColor}20` }}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <Text className={`text-base font-medium ${isDestructive ? 'text-red-500' : 'text-white'}`}>
                {label}
            </Text>
        </View>

        <View className="flex-row items-center">
            {value && <Text className="text-gray-400 mr-2 text-sm">{value}</Text>}
            {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#6B7280" />}
        </View>
    </TouchableOpacity>
);

const SectionHeader = ({ title }: SectionHeaderProps) => (
    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4 mt-6">
        {title}
    </Text>
);

// --- MODAL: Edit Profile (Logic Integrated) ---
const EditProfileModal = ({ visible, onClose }: ModalProps) => {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Load initial data when modal opens
    useEffect(() => {
        if (visible) {
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
        }
    }, [visible]);

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

            onClose(); // Close modal on success
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <ScrollView className="flex-1 bg-[#111827]">
                <View className="p-5 pt-14">
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

                    <TouchableOpacity onPress={onClose} className="mt-4 items-center mb-10">
                        <Text className="text-gray-500">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );
};

// --- MODAL: Change Password (Logic Integrated) ---
const ChangePasswordModal = ({ visible, onClose }: ModalProps) => {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Reset fields when modal opens/closes
    useEffect(() => {
        if (!visible) {
            setPassword('');
            setConfirmPassword('');
        }
    }, [visible]);

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
            onClose(); // Close modal on success
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-[#111827] p-5 pt-14">
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

                <TouchableOpacity onPress={onClose} className="mt-4 items-center">
                    <Text className="text-gray-500">Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

// --- MAIN SCREEN ---
export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    // Modal State
    const [isProfileModalVisible, setProfileModalVisible] = useState(false);
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

    useEffect(() => {
        async function getUserProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUserEmail(user?.email || "Guest");
            } catch (error) {
                console.log('Error:', error);
            } finally {
                setLoading(false);
            }
        }
        getUserProfile();
    }, []);

    const handleSignOut = async () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: async () => {
                    await supabase.auth.signOut();
                    router.replace('/');
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#111827] justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-[#111827]"
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 20 }}
        >
            {/* --- Modals --- */}
            <EditProfileModal
                visible={isProfileModalVisible}
                onClose={() => setProfileModalVisible(false)}
            />
            <ChangePasswordModal
                visible={isPasswordModalVisible}
                onClose={() => setPasswordModalVisible(false)}
            />

            {/* --- Section 1: Account --- */}
            <SectionHeader title="Account Settings" />
            <View>
                <SettingsItem
                    icon="person"
                    iconColor="#3B82F6"
                    label="Edit Profile"
                    onPress={() => setProfileModalVisible(true)}
                />
                <SettingsItem
                    icon="lock-closed"
                    iconColor="#3B82F6"
                    label="Change Password"
                    onPress={() => setPasswordModalVisible(true)}
                />
            </View>

            {/* --- Section 2: Privacy --- */}
            <SectionHeader title="Privacy & Security" />
            <View>
                <SettingsItem
                    icon="location"
                    iconColor="#10B981"
                    label="Location Sharing"
                    value="Always"
                    onPress={() => {}}
                />
                <SettingsItem
                    icon="shield-checkmark"
                    iconColor="#10B981"
                    label="Data Privacy"
                    onPress={() => {}}
                />
            </View>

            {/* --- Section 3: Notifications --- */}
            <SectionHeader title="Notification Preferences" />
            <View>
                <SettingsItem
                    icon="notifications"
                    iconColor="#F59E0B"
                    label="Push Notifications"
                    onPress={() => {}}
                />
                <SettingsItem
                    icon="mail"
                    iconColor="#F59E0B"
                    label="Email Preferences"
                    onPress={() => {}}
                />
            </View>

            {/* --- Section 4: About --- */}
            <SectionHeader title="About" />
            <View>
                <SettingsItem
                    icon="information-circle"
                    iconColor="#6B7280"
                    label="Version"
                    value="2.4.0 (142)"
                    onPress={() => {}}
                />
                <SettingsItem
                    icon="document-text"
                    iconColor="#6B7280"
                    label="Terms of Service"
                    onPress={() => {}}
                />
            </View>

            <TouchableOpacity
                onPress={handleSignOut}
                className="mt-8 bg-[#1F2937] rounded-xl p-4 flex-row justify-center items-center border border-red-900/30"
            >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="text-red-500 font-bold text-base">Log Out</Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-600 mt-6 text-sm">
                Logged in as {userEmail}
            </Text>

        </ScrollView>
    );
}
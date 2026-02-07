import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

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

// --- Components ---
const SettingsItem = ({ icon, iconColor, label, value, onPress, isDestructive = false }: SettingsItemProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between p-4 bg-[#1F2937] border-b border-gray-700 first:rounded-t-xl last:rounded-b-xl last:border-b-0"
    >
        <View className="flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 bg-opacity-20`} style={{ backgroundColor: `${iconColor}20` }}>
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

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

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
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 60 }}
        >
            {/* --- NEW: Close Button (X) --- */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-[#1F2937] mb-4"
            >
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-white mb-2">Settings</Text>

            {/* --- Section 1: Account --- */}
            <SectionHeader title="Account Settings" />
            <View>
                <SettingsItem
                    icon="person"
                    iconColor="#3B82F6"
                    label="Edit Profile"
                    onPress={() => router.push('/edit-profile' as Href)}
                />
                <SettingsItem
                    icon="lock-closed"
                    iconColor="#3B82F6"
                    label="Change Password"
                    onPress={() => router.push('/change-password' as Href)}
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
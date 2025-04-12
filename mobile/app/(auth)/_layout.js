import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export default function AuthLayout() {
    const { isAuthenticated, loading } = useAuth();

    // Show loading indicator while checking authentication
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // Redirect authenticated users to the tabs
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Login'
                }}
            />
            <Stack.Screen
                name="signup/index"
                options={{
                    title: 'Sign Up'
                }}
            />
        </Stack>
    );
} 
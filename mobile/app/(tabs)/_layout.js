import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function TabLayout() {
    const { isAuthenticated, loading } = useAuth();

    // If not authenticated and not loading, redirect to auth flow
    if (!loading && !isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }

    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favorites',
                    tabBarIcon: ({ color }) => <FontAwesome name="star" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="publish"
                options={{
                    title: 'Publish',
                    tabBarIcon: ({ color }) => <FontAwesome name="plus-square" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
} 
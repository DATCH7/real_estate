import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="signup"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="home"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="account"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="debug"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="property-details"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </AuthProvider>
    );
} 
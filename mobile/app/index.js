import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// This component checks if the user is authenticated or not
export default function Index() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }

    // Redirect to home screen if authenticated
    return <Redirect href="/(tabs)" />;
}

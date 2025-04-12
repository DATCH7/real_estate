import { router } from 'expo-router';

/**
 * Safely navigate after logout
 * This function ensures consistent navigation after logout
 * by adding a delay to prevent navigation conflicts
 */
export const navigateAfterLogout = () => {
    // Clear any existing navigation before pushing to auth
    setTimeout(() => {
        // Use replace to prevent going back to authenticated screens
        router.replace('/(auth)');
    }, 300);
};

/**
 * Check if a route exists and navigate safely
 * @param {string} route - Route to navigate to
 */
export const safeNavigate = (route) => {
    if (route) {
        try {
            router.push(route);
        } catch (error) {
            console.error(`Navigation error to ${route}:`, error);
            // Fallback to home if navigation fails
            router.push('/');
        }
    }
}; 
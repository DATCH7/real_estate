// API Configuration
import { Platform } from 'react-native';

// Network configuration
// Use appropriate IP/host for different platforms
let API_HOST;

if (Platform.OS === 'web') {
    API_HOST = 'localhost';
} else if (Platform.OS === 'android') {
    // For Android emulator, special IP is needed to access host machine
    API_HOST = '10.0.2.2';
} else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    API_HOST = 'localhost';
} else {
    // Default fallback
    API_HOST = 'localhost';
}

// Port configuration
const API_PORT = 5000;

// Full API URL with protocol
export const API_URL = `http://${API_HOST}:${API_PORT}`;

// Add a helper function to debug network issues
export const debugNetworkConfig = () => {
    console.log('------ Network Configuration Debug ------');
    console.log(`Platform: ${Platform.OS}`);
    console.log(`API Host: ${API_HOST}`);
    console.log(`API Port: ${API_PORT}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`Example API endpoint: ${API_URL}/api/properties`);
    console.log(`Example uploads path: ${API_URL}/uploads/image.jpg`);
    console.log('----------------------------------------');
};

// Log the configuration on import
debugNetworkConfig();

// All API endpoints should be prefixed with /api/ to match the server routes
// e.g., ${API_URL}/api/properties, ${API_URL}/api/login, etc. 
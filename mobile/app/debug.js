import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Alert,
    Linking,
    Clipboard
} from 'react-native';
import { API_URL } from '../config';
import { FontAwesome } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../contexts/AuthContext';
import { getPhotoUrl } from '../utils/photoHelper';

export default function DebugScreen() {
    const { isAuthenticated, user, resetAuthState } = useAuth();
    const [results, setResults] = useState({});
    const [testing, setTesting] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [imageTest, setImageTest] = useState({ status: 'not_tested', url: null });

    const endpoints = [
        { name: 'serverRoot', path: '/', method: 'GET' },
        { name: 'checkAuth', path: '/api/checkAuth', method: 'GET' },
        { name: 'properties', path: '/api/properties', method: 'GET' },
        { name: 'getUserData', path: '/api/getUserData', method: 'GET' },
        { name: 'uploads', path: '/uploads', method: 'GET' },
        { name: 'signup', path: '/api/signup', method: 'OPTIONS' },
        { name: 'login', path: '/api/login', method: 'OPTIONS' },
    ];

    const runApiTests = async () => {
        setTesting(true);
        const newResults = {};
        const newSuggestions = [];

        try {
            // Test all endpoints
            for (const endpoint of endpoints) {
                newResults[endpoint.name] = await testEndpoint(
                    endpoint.path,
                    endpoint.method
                );

                if (!newResults[endpoint.name].success) {
                    console.error(`Failed testing ${endpoint.name}: ${endpoint.path}`);
                }
            }

            // Test image URL if uploads endpoint is successful
            if (newResults.uploads && newResults.uploads.success &&
                newResults.uploads.data &&
                newResults.uploads.data.files &&
                newResults.uploads.data.files.length > 0) {

                const testImage = newResults.uploads.data.files[0];
                const testImageUrl = testImage.url;

                setImageTest({
                    status: 'testing',
                    url: testImageUrl
                });

                // We're just setting this for display purposes, not actually loading the image here
                console.log('Testing image URL:', testImageUrl);
            } else {
                setImageTest({
                    status: 'no_images',
                    url: null
                });

                newSuggestions.push('No images found in uploads directory. Try publishing a property with images.');
            }

            // Generate suggestions based on results
            if (!newResults.serverRoot.success) {
                if (Platform.OS === 'android') {
                    newSuggestions.push('For Android emulator, make sure your config is using 10.0.2.2 instead of localhost');
                    newSuggestions.push('Check if the server is running at ' + API_URL.replace('10.0.2.2', 'localhost'));
                } else {
                    newSuggestions.push('Check if your server is running at ' + API_URL);
                }
                newSuggestions.push('Verify network permissions in app.json (android.permissions: ["INTERNET"])');
                newSuggestions.push('Make sure android.usesCleartextTraffic is set to true in app.json');
            }

            if (!newResults.uploads.success) {
                newSuggestions.push('The uploads directory is not accessible.');
                newSuggestions.push('Check if the uploads directory exists on the server.');
                newSuggestions.push('Verify the server is properly serving static files from uploads directory.');
            }

            let failedApiEndpoints = 0;
            for (const endpoint of endpoints.filter(e => e.path.startsWith('/api'))) {
                if (!newResults[endpoint.name].success) {
                    failedApiEndpoints++;
                }
            }

            if (failedApiEndpoints > 0 && newResults.serverRoot.success) {
                newSuggestions.push('API is reachable but endpoints are failing. Check if your API routes include the \'/api\' prefix');
                newSuggestions.push('Verify the server has the correct routes defined in routes.js');
            }

            setResults(newResults);
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error('Error running tests:', error);
            newSuggestions.push(`Unexpected error: ${error.message}`);
            setSuggestions(newSuggestions);
        } finally {
            setTesting(false);
        }
    };

    const testEndpoint = async (path, method) => {
        console.log(`Testing ${method} ${API_URL}${path}`);
        const startTime = Date.now();

        try {
            const response = await fetch(`${API_URL}${path}`, {
                method,
                headers: {
                    'Accept': 'application/json',
                }
            });

            const endTime = Date.now();

            let data = null;
            try {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    data = text.substring(0, 100); // Truncate long text responses
                }
            } catch (e) {
                console.error(`Error reading response body: ${e.message}`);
            }

            return {
                status: response.status,
                statusText: response.statusText,
                time: endTime - startTime,
                success: response.status < 400,
                data: data
            };
        } catch (error) {
            console.error(`Error testing ${path}:`, error);
            return {
                error: error.message,
                success: false
            };
        }
    };

    const handleImageTest = () => {
        if (imageTest.url) {
            // This just tests if we're constructing URLs correctly
            const placeholderUrl = 'https://placehold.co/300x200/gray/white?text=No+Image';
            const testUrl = getPhotoUrl(imageTest.url.split('/').pop());

            Alert.alert(
                "Image URL Test",
                `Original URL: ${imageTest.url}\n\nConstructed URL: ${testUrl}\n\nDo these URLs match? If not, there might be issues with URL construction.`,
                [{ text: "OK" }]
            );
        } else {
            Alert.alert("No Test Image", "No images found to test URLs with.");
        }
    };

    const handleOpenConfig = () => {
        Alert.alert(
            "Configuration Files",
            "The following files need to be checked:\n\n" +
            "1. mobile/config.js - API URL configuration\n" +
            "2. mobile/app.json - Network permissions\n" +
            "3. server/server.js - Server setup\n" +
            "4. server/routes.js - API routes\n" +
            "5. mobile/utils/photoHelper.js - Image URL handling",
            [{ text: "OK" }]
        );
    };

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Alert.alert("Copied", "Information copied to clipboard");
    };

    return (
        <ScreenLayout
            title="API Debug"
            subtitle="Connection Information"
            scrollable={true}
        >
            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Environment Information</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Platform: </Text>
                            <Text style={styles.infoValue}>{Platform.OS}</Text>
                        </Text>
                        <Text style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Version: </Text>
                            <Text style={styles.infoValue}>{Platform.Version}</Text>
                        </Text>
                        <Text style={styles.infoRow}>
                            <Text style={styles.infoLabel}>API URL: </Text>
                            <Text style={styles.infoValue}>{API_URL}</Text>
                        </Text>
                        <Text style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Authentication: </Text>
                            <Text style={styles.infoValue}>
                                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                            </Text>
                        </Text>
                        {isAuthenticated && user && (
                            <Text style={styles.infoRow}>
                                <Text style={styles.infoLabel}>User: </Text>
                                <Text style={styles.infoValue}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </Text>
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>API Tests</Text>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={runApiTests}
                        disabled={testing}
                    >
                        <Text style={styles.testButtonText}>
                            {testing ? 'Running Tests...' : 'Run API Tests'}
                        </Text>
                        {testing && <ActivityIndicator color="#fff" style={{ marginLeft: 10 }} />}
                    </TouchableOpacity>

                    {Object.keys(results).length > 0 && (
                        <View style={styles.resultsContainer}>
                            {Object.entries(results).map(([key, value]) => (
                                <View key={key} style={styles.resultItem}>
                                    <View style={styles.resultHeader}>
                                        <Text style={styles.resultName}>{key}</Text>
                                        <View style={[
                                            styles.statusIndicator,
                                            { backgroundColor: value.success ? '#4CAF50' : '#F44336' }
                                        ]} />
                                    </View>
                                    <Text style={styles.resultDetails}>
                                        Status: {value.status} {value.statusText}
                                    </Text>
                                    {value.time && (
                                        <Text style={styles.resultDetails}>
                                            Time: {value.time}ms
                                        </Text>
                                    )}
                                    {value.error && (
                                        <Text style={styles.resultError}>
                                            Error: {value.error}
                                        </Text>
                                    )}
                                    {value.data && (
                                        <TouchableOpacity
                                            onPress={() => copyToClipboard(JSON.stringify(value.data, null, 2))}
                                            style={styles.dataCopyButton}
                                        >
                                            <Text style={styles.dataCopyText}>
                                                Copy Response Data
                                            </Text>
                                            <FontAwesome name="copy" size={14} color="#666" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {imageTest.url && (
                        <View style={styles.imageTestContainer}>
                            <Text style={styles.imageTestTitle}>Image URL Test</Text>
                            <Text style={styles.imageTestDescription}>
                                Testing if image URLs are correctly constructed
                            </Text>
                            <TouchableOpacity
                                style={styles.imageTestButton}
                                onPress={handleImageTest}
                            >
                                <Text style={styles.imageTestButtonText}>
                                    Test Image URL Construction
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {suggestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                        {suggestions.map((suggestion, index) => (
                            <View key={index} style={styles.suggestionItem}>
                                <FontAwesome name="lightbulb-o" size={20} color="#d77710" />
                                <Text style={styles.suggestionText}>{suggestion}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Troubleshooting Actions</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleOpenConfig}
                    >
                        <FontAwesome name="file-code-o" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Configuration Files</Text>
                    </TouchableOpacity>

                    {isAuthenticated && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => {
                                Alert.alert(
                                    "Reset Auth State",
                                    "Are you sure you want to reset your authentication state? This will log you out.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Reset",
                                            style: "destructive",
                                            onPress: resetAuthState
                                        }
                                    ]
                                );
                            }}
                        >
                            <FontAwesome name="sign-out" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Reset Auth State</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#666',
        width: 110,
    },
    infoValue: {
        flex: 1,
        color: '#333',
    },
    testButton: {
        backgroundColor: '#d77710',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    testButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultsContainer: {
        marginBottom: 16,
    },
    resultItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    resultDetails: {
        color: '#666',
        marginBottom: 4,
    },
    resultError: {
        color: '#F44336',
        marginTop: 4,
    },
    dataCopyButton: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataCopyText: {
        color: '#666',
        marginRight: 6,
    },
    suggestionItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFDE7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    suggestionText: {
        flex: 1,
        marginLeft: 10,
        color: '#333',
    },
    actionButton: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    imageTestContainer: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    imageTestTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2E7D32',
        marginBottom: 8,
    },
    imageTestDescription: {
        color: '#388E3C',
        marginBottom: 12,
    },
    imageTestButton: {
        backgroundColor: '#43A047',
        borderRadius: 6,
        padding: 10,
        alignItems: 'center',
    },
    imageTestButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
}); 
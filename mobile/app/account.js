import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { Redirect, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import { fetchUserData } from '../utils/apiHelper';
import { navigateAfterLogout } from '../utils/navigationHelper';

export default function AccountScreen() {
    const { user, isAuthenticated, loading, logout, checkAuth } = useAuth();
    const [userData, setUserData] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Move useEffect to the top level before any conditional returns
    useEffect(() => {
        // Only fetch user data if logged in
        if (isAuthenticated) {
            loadUserData();
        } else {
            // If not authenticated, don't try to load data
            setDataLoading(false);
        }
    }, [isAuthenticated]);

    const loadUserData = async () => {
        try {
            setDataLoading(true);
            setError(null);
            console.log("Loading user data...");

            const data = await fetchUserData();
            console.log("User data fetched successfully");

            setUserData(data);
        } catch (error) {
            console.error('Error loading user data:', error);
            setError(error.message || 'Failed to fetch user data');
            Alert.alert('Error', 'Failed to fetch user data. Please try again later.');
        } finally {
            setDataLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigateAfterLogout();
        } catch (error) {
            console.error('Logout Error:', error);
            Alert.alert('Logout Error', 'An error occurred during logout. Please try again later.');
        }
    };

    const handleRetry = () => {
        loadUserData();
    };

    const handleRefreshAuth = async () => {
        try {
            await checkAuth();
            // After refreshing auth, try to load user data again
            loadUserData();
        } catch (error) {
            console.error('Auth refresh error:', error);
            Alert.alert('Authentication Error', 'Failed to refresh authentication. Please try logging in again.');
            router.replace('/');
        }
    };

    // Show loading indicator while checking authentication
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/" />;
    }

    return (
        <ScreenLayout
            title="Account Information"
            scrollable={true}
        >
            {dataLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <FontAwesome name="exclamation-circle" size={48} color="#ff3b30" style={styles.errorIcon} />
                    <Text style={styles.errorText}>Failed to load account information</Text>
                    <Text style={styles.errorDetail}>{error}</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.refreshAuthButton} onPress={handleRefreshAuth}>
                            <Text style={styles.refreshAuthButtonText}>Refresh Authentication</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <FontAwesome name="user" size={20} color="#007AFF" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>
                                    {userData?.firstName} {userData?.lastName}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <FontAwesome name="envelope" size={20} color="#007AFF" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{userData?.email}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <FontAwesome name="phone" size={20} color="#007AFF" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{userData?.phone || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <FontAwesome name="user-circle" size={20} color="#007AFF" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>{userData?.role || 'User'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <FontAwesome name="sign-out" size={20} color="#fff" style={styles.logoutIcon} />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIcon: {
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333',
    },
    errorDetail: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    refreshAuthButton: {
        backgroundColor: '#5AC8FA',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    refreshAuthButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    icon: {
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 
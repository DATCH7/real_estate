import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Redirect, useRouter } from 'expo-router';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
        return <Redirect href="/" />;
    }

    // Show loading indicator while checking authentication
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const navigateToCategory = (category) => {
        if (category === 'sale') {
            router.push('/properties-for-sale');
        } else {
            router.push('/properties-for-rent');
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={`Hello, ${user?.firstName || 'there'}`}
                subtitle="Welcome to your real estate companion"
            />

            <ScrollView style={styles.scrollView}>
                {/* Welcome Banner */}
                <View style={styles.banner}>
                    <Text style={styles.bannerTitle}>Find Your Perfect Space</Text>
                    <Text style={styles.bannerSubtitle}>
                        The easiest way to discover, evaluate, and secure properties in your area
                    </Text>
                </View>

                {/* Property Categories */}
                <Text style={styles.sectionTitle}>Explore Properties</Text>
                <View style={styles.categoryContainer}>
                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigateToCategory('sale')}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#e1f5fe' }]}>
                            <Ionicons name="home" size={24} color="#0288d1" />
                        </View>
                        <Text style={styles.categoryTitle}>For Sale</Text>
                        <Text style={styles.categorySubtitle}>Find your dream home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categoryCard}
                        onPress={() => navigateToCategory('rent')}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: '#f9fbe7' }]}>
                            <Ionicons name="key" size={24} color="#afb42b" />
                        </View>
                        <Text style={styles.categoryTitle}>For Rent</Text>
                        <Text style={styles.categorySubtitle}>Quality rentals in prime locations</Text>
                    </TouchableOpacity>
                </View>

                {/* Featured Content */}
                <Text style={styles.sectionTitle}>Featured Content</Text>
                <View style={styles.featuredContainer}>
                    <View style={styles.featuredCard}>
                        <View style={styles.featuredIcon}>
                            <Ionicons name="star" size={32} color="#d77710" />
                        </View>
                        <Text style={styles.featuredTitle}>Premium Listings</Text>
                        <Text style={styles.featuredDescription}>
                            Discover exceptional properties selected for their outstanding features,
                            prime locations, and excellent value for money.
                        </Text>
                    </View>
                </View>

                {/* Key Benefits */}
                <Text style={styles.sectionTitle}>Why Choose Us</Text>
                <View style={styles.benefitsContainer}>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
                        <Text style={styles.benefitText}>Verified listings updated daily</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="chatbubble-ellipses" size={28} color="#ff9800" />
                        <Text style={styles.benefitText}>Direct contact with property owners</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="shield-checkmark" size={28} color="#2196f3" />
                        <Text style={styles.benefitText}>Secure and seamless experience</Text>
                    </View>
                </View>

                {/* Get Started */}
                <Text style={styles.sectionTitle}>Get Started</Text>
                <View style={styles.getStartedContainer}>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={() => router.push('/publish-property')}
                    >
                        <Ionicons name="add-circle" size={22} color="#fff" />
                        <Text style={styles.getStartedButtonText}>List Your Property</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    banner: {
        backgroundColor: '#d77710',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
        color: '#333',
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    categorySubtitle: {
        fontSize: 14,
        color: '#666',
    },
    featuredContainer: {
        marginBottom: 24,
    },
    featuredCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featuredIcon: {
        alignItems: 'center',
        marginBottom: 16,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    featuredDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        textAlign: 'center',
    },
    benefitsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    benefitText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
    },
    getStartedContainer: {
        marginBottom: 30,
    },
    getStartedButton: {
        backgroundColor: '#d77710',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    getStartedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
}); 
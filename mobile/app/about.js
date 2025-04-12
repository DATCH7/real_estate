import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Header from '../components/Header';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Header
                title="About Us"
                subtitle="Our mission and values"
                showBackButton={true}
            />

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>
                        Welcome to Real Estate App, your ultimate destination for all your real estate needs. Whether you are looking for a new home, a modern apartment, or a profitable investment, our platform is designed to offer you an intuitive and efficient search experience.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.sectionText}>
                        We strive to connect property seekers with their dream spaces while providing property owners with a seamless platform to showcase their listings. Our goal is to simplify the real estate journey for everyone involved.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Why Choose Us</Text>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureTitle}>• Verified Listings</Text>
                        <Text style={styles.featureText}>
                            All properties on our platform are verified to ensure you get accurate and reliable information.
                        </Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureTitle}>• User-Friendly Experience</Text>
                        <Text style={styles.featureText}>
                            Our intuitive interface makes it easy to search, filter, and find properties that match your specific requirements.
                        </Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureTitle}>• Direct Communication</Text>
                        <Text style={styles.featureText}>
                            Connect directly with property owners or agents to ask questions and arrange viewings without intermediaries.
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Our Team</Text>
                    <Text style={styles.sectionText}>
                        We are a dedicated team of real estate professionals and technology experts committed to revolutionizing the property market through innovation and exceptional service.
                    </Text>
                </View>

                <View style={styles.version}>
                    <Text style={styles.versionText}>Version 1.0</Text>
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
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    welcomeText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d77710',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    featureItem: {
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    featureText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#666',
    },
    version: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    versionText: {
        fontSize: 14,
        color: '#999',
    },
}); 
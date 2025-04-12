import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Header';

export default function ContactScreen() {
    // Contact information
    const contactInfo = {
        email: 'immobiliercomp@gmail.com',
        phone: '+6 779 943 556',
        address: '123 Gueliz, Marrakech, Morocco'
    };

    // Handle email press
    const handleEmailPress = () => {
        Linking.openURL(`mailto:${contactInfo.email}`)
            .catch(err => {
                Alert.alert('Error', 'Could not open email client');
                console.error('Error opening email:', err);
            });
    };

    // Handle phone press
    const handlePhonePress = () => {
        Linking.openURL(`tel:${contactInfo.phone.replace(/\s/g, '')}`)
            .catch(err => {
                Alert.alert('Error', 'Could not open phone dialer');
                console.error('Error opening phone dialer:', err);
            });
    };

    // Handle address press (open in maps)
    const handleAddressPress = () => {
        const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`;
        Linking.openURL(mapUrl)
            .catch(err => {
                Alert.alert('Error', 'Could not open maps application');
                console.error('Error opening maps:', err);
            });
    };

    return (
        <View style={styles.container}>
            <Header
                title="Contact Us"
                subtitle="Get in touch with our team"
                showBackButton={true}
            />

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>
                        We're here to help! If you have any questions, feedback, or inquiries about our real estate services, please don't hesitate to reach out using any of the contact methods below.
                    </Text>
                </View>

                <View style={styles.contactCard}>
                    <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#d9534f' }]}>
                            <FontAwesome name="envelope" size={24} color="#fff" />
                        </View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactTitle}>Email</Text>
                            <Text style={styles.contactInfo}>{contactInfo.email}</Text>
                            <Text style={styles.contactSubtext}>Tap to send an email</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.contactCard}>
                    <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#5bc0de' }]}>
                            <FontAwesome name="phone" size={24} color="#fff" />
                        </View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactTitle}>Phone</Text>
                            <Text style={styles.contactInfo}>{contactInfo.phone}</Text>
                            <Text style={styles.contactSubtext}>Tap to call</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.contactCard}>
                    <TouchableOpacity style={styles.contactItem} onPress={handleAddressPress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#5cb85c' }]}>
                            <FontAwesome name="map-marker" size={24} color="#fff" />
                        </View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactTitle}>Address</Text>
                            <Text style={styles.contactInfo}>{contactInfo.address}</Text>
                            <Text style={styles.contactSubtext}>Tap to view on map</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Office Hours</Text>
                    <Text style={styles.sectionText}>
                        Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
                        Saturday: 10:00 AM - 4:00 PM{'\n'}
                        Sunday: Closed
                    </Text>
                </View>

                <View style={styles.version}>
                    <Text style={styles.versionText}>We typically respond within 24 hours</Text>
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
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactDetails: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    contactInfo: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    contactSubtext: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
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
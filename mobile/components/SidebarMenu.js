import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { navigateAfterLogout } from '../utils/navigationHelper';

const { width, height } = Dimensions.get('window');

export default function SidebarMenu({ isVisible, onClose }) {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();

    // If the menu is not visible, don't render anything
    if (!isVisible) {
        return null;
    }

    const navigateTo = (route) => {
        onClose(); // Close the menu first
        router.push(route);
    };

    const handleLogout = async () => {
        try {
            onClose(); // Close menu first

            // Add a small delay before logout to ensure menu is closed completely
            setTimeout(async () => {
                await logout(); // Logout the user
                navigateAfterLogout();
            }, 300);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Overlay for closing the menu when tapping outside */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Sidebar content */}
            <SafeAreaView style={styles.sidebar}>
                <View style={styles.header}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <FontAwesome name="times" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {isAuthenticated && (
                    <View style={styles.userSection}>
                        <View style={styles.userAvatar}>
                            <FontAwesome name="user-circle" size={50} color="#007AFF" />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user?.firstName} {user?.lastName}
                            </Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                )}

                <ScrollView style={styles.menuItems}>
                    <Text style={styles.menuSectionTitle}>NAVIGATION</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo(isAuthenticated ? '/(tabs)' : '/')}
                    >
                        <FontAwesome name="home" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo('/properties-for-sale')}
                    >
                        <FontAwesome name="building" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Properties For Sale</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo('/properties-for-rent')}
                    >
                        <FontAwesome name="key" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Properties For Rent</Text>
                    </TouchableOpacity>

                    {isAuthenticated && (
                        <>
                            <Text style={styles.menuSectionTitle}>YOUR ACCOUNT</Text>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigateTo('/account')}
                            >
                                <FontAwesome name="user" size={20} color="#333" style={styles.menuIcon} />
                                <Text style={styles.menuText}>My Account</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigateTo('/publish-property')}
                            >
                                <FontAwesome name="plus-square" size={20} color="#333" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Publish Property</Text>
                            </TouchableOpacity>

                            {/* Admin Panel - only visible to admin users */}
                            {user?.role === 'admin' && (
                                <TouchableOpacity
                                    style={[styles.menuItem, styles.adminItem]}
                                    onPress={() => navigateTo('/admin-panel')}
                                >
                                    <FontAwesome name="shield" size={20} color="#d77710" style={styles.menuIcon} />
                                    <Text style={[styles.menuText, styles.adminText]}>Admin Panel</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.menuItem, styles.logoutItem]}
                                onPress={handleLogout}
                            >
                                <FontAwesome name="sign-out" size={20} color="#FF3B30" style={styles.menuIcon} />
                                <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <Text style={styles.menuSectionTitle}>ACCOUNT</Text>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigateTo('/')}
                            >
                                <FontAwesome name="sign-in" size={20} color="#333" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Login</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigateTo('/(auth)/signup')}
                            >
                                <FontAwesome name="user-plus" size={20} color="#333" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Sign Up</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <Text style={styles.menuSectionTitle}>ABOUT</Text>

                    {/* Debug option - hidden in production but accessible for presentation if needed */}
                    {/* <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo('/debug')}
                    >
                        <FontAwesome name="bug" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Debug</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo('/about')}
                    >
                        <FontAwesome name="info-circle" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>About Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo('/contact')}
                    >
                        <FontAwesome name="envelope" size={20} color="#333" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Contact</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={() => navigateTo('/debug')}
                            style={styles.footerTouchable}
                        >
                            <Text style={styles.footerText}>Real Estate App v1.0</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 1000,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        width: width * 0.75, // 75% of screen width
        maxWidth: 300,
        backgroundColor: '#fff',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    userSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    menuItems: {
        flex: 1,
    },
    menuSectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    menuIcon: {
        marginRight: 15,
        width: 20,
        textAlign: 'center',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    logoutItem: {
        marginTop: 10,
    },
    logoutText: {
        color: '#FF3B30',
    },
    adminItem: {
        backgroundColor: '#f9f9f9',
    },
    adminText: {
        color: '#d77710',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 20,
        alignItems: 'center',
    },
    footerTouchable: {
        // Add any necessary styles for the TouchableOpacity
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    },
}); 
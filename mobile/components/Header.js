import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AccountButton from './AccountButton';
import { useRouter } from 'expo-router';
import SidebarMenu from './SidebarMenu';

export default function Header({ title, subtitle, showBackButton }) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleBackPress = () => {
        router.back();
    };

    return (
        <>
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    {showBackButton ? (
                        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                            <FontAwesome name="arrow-left" size={20} color="#007AFF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                            <FontAwesome name="bars" size={20} color="#007AFF" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                </View>
                <AccountButton />
            </View>

            {/* Sidebar Menu */}
            <SidebarMenu
                isVisible={showMenu}
                onClose={() => setShowMenu(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        marginRight: 15,
        padding: 5,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
}); 
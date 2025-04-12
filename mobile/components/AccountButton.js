import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function AccountButton() {
    const router = useRouter();

    const navigateToAccount = () => {
        router.push('/account');
    };

    return (
        <TouchableOpacity style={styles.accountButton} onPress={navigateToAccount}>
            <FontAwesome name="user-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    accountButton: {
        padding: 8,
        borderRadius: 8,
    },
}); 
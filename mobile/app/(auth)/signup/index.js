import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../../config';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';

export default function SignupScreen() {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        const errors = [];
        if (password.length < minLength) {
            errors.push(`- At least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('- At least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('- At least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('- At least one number');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    const validateForm = () => {
        console.log('Starting form validation...');
        console.log('Form data:', {
            ...formData,
            password: formData.password ? '[PRESENT]' : '[MISSING]'
        });

        // Check if all fields are filled
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.phone) {
            console.log('Validation failed: Missing required fields');
            console.log('Missing fields:', {
                first_name: !formData.first_name,
                last_name: !formData.last_name,
                email: !formData.email,
                password: !formData.password,
                phone: !formData.phone
            });
            Alert.alert('Error', 'All fields are required');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            console.log('Validation failed: Invalid email format');
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        // Password validation
        const passwordValidation = validatePassword(formData.password);
        console.log('Password validation result:', {
            isValid: passwordValidation.isValid,
            errors: passwordValidation.errors
        });

        if (!passwordValidation.isValid) {
            Alert.alert(
                'Invalid Password',
                'Password must contain:\n' + passwordValidation.errors.join('\n')
            );
            return false;
        }

        // Basic phone validation
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(formData.phone)) {
            console.log('Validation failed: Invalid phone format');
            Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
            return false;
        }

        console.log('Form validation passed successfully');
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        setLoading(true);
        try {
            console.log('Starting signup process...');

            const userData = {
                firstName: formData.first_name,
                lastName: formData.last_name,
                email: formData.email.toLowerCase(),
                password: formData.password,
                phone: formData.phone
            };

            // Use the signup function from AuthContext
            const result = await signup(userData);

            console.log('Signup successful');

            // Clear form data first
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: ''
            });

            // Show success alert with immediate navigation
            const message = 'Account created successfully!';
            console.log('Showing success alert with message:', message);

            // Use a Promise to handle the alert response
            new Promise((resolve) => {
                Alert.alert(
                    'Success! 🎉',
                    message,
                    [
                        {
                            text: 'Continue to App',
                            onPress: resolve
                        }
                    ],
                    {
                        cancelable: false,
                        onDismiss: resolve
                    }
                );
            }).then(() => {
                console.log('Alert closed, navigating to main app...');
                router.replace('/(tabs)');
            });

        } catch (error) {
            console.error('Signup error:', error);

            // Show error alert
            new Promise((resolve) => {
                Alert.alert(
                    'Registration Failed',
                    error.message || 'Failed to create account. Please try again.',
                    [
                        {
                            text: 'OK',
                            onPress: resolve,
                            style: 'cancel'
                        }
                    ],
                    {
                        cancelable: false,
                        onDismiss: resolve
                    }
                );
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Create Account</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.first_name}
                        onChangeText={(text) => handleChange('first_name', text)}
                        placeholder="Enter your first name"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.last_name}
                        onChangeText={(text) => handleChange('last_name', text)}
                        placeholder="Enter your last name"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={formData.password}
                            onChangeText={(text) => handleChange('password', text)}
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <FontAwesome
                                name={showPassword ? "eye" : "eye-slash"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.replace('/(auth)/index')}
                >
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginTextBold}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        color: '#666',
    },
    loginTextBold: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'transparent',
    },
    eyeIcon: {
        padding: 12,
    },
}); 
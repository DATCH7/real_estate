import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { apiRequest } from '../utils/apiHelper';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            console.log('Checking authentication status...');
            const data = await apiRequest('/api/checkAuth');

            if (data && data.isAuthenticated) {
                console.log('User is authenticated:', data.user?.email);
                setUser(data.user);
            } else {
                console.log('User is not authenticated');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Attempting login for user:', email);

            const data = await apiRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (data && data.user) {
                console.log('Login successful for:', data.user.email);
                setUser(data.user);
                return data;
            } else {
                const errorMsg = data?.message || 'Login failed with no error message';
                console.error('Login failed:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Login error:', error.message);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Attempting signup for:', userData.email);

            const data = await apiRequest('/api/signup', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (data && data.user) {
                console.log('Signup successful for:', data.user.email);
                setUser(data.user);
                return data;
            } else {
                const errorMsg = data?.message || 'Signup failed with no error message';
                console.error('Signup failed:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Signup error:', error.message);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            console.log('Attempting logout...');
            // First clear local user state
            setUser(null);

            // Clear any stored data first
            try {
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('authToken');
                // Add any other auth-related items you might be storing
                console.log('Auth storage items cleared');
            } catch (storageError) {
                console.error('Error clearing storage during logout:', storageError);
            }

            // Then attempt to logout on server
            await apiRequest('/api/logout', {
                method: 'POST'
            });
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout request failed:', error.message);
            // We've already reset user state above, so no further action needed
        }
    };

    // Reset all auth state - useful for troubleshooting
    const resetAuthState = async () => {
        try {
            console.log('Resetting all authentication state...');
            setUser(null);
            setLoading(false);
            setError(null);

            // Clear any AsyncStorage if you're using it
            // This is useful if you're storing any tokens or user data
            try {
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('authToken');
                // Add any other auth-related items you might be storing
                console.log('Auth storage items cleared');
            } catch (storageError) {
                console.error('Error clearing auth storage:', storageError);
            }

            return true;
        } catch (error) {
            console.error('Error resetting auth state:', error);
            return false;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
        checkAuth, // Expose the checkAuth function to allow manual refresh
        resetAuthState, // Expose the reset function
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
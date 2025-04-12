import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Header from './Header';

/**
 * ScreenLayout - A wrapper component for consistent screen layout
 * 
 * @param {Object} props
 * @param {string} props.title - Screen title
 * @param {string} props.subtitle - Optional subtitle
 * @param {boolean} props.showBackButton - Whether to show a back button
 * @param {boolean} props.scrollable - Whether content should be scrollable
 * @param {boolean} props.keyboardAvoiding - Whether to avoid keyboard
 * @param {Object} props.style - Additional style for the content container
 * @param {React.ReactNode} props.children - Screen content
 */
export default function ScreenLayout({
    title,
    subtitle,
    showBackButton = false,
    scrollable = true,
    keyboardAvoiding = false,
    style,
    children
}) {
    // Base content component
    let ContentComponent = scrollable ? ScrollView : View;

    // Content component props
    const contentProps = scrollable ? {
        contentContainerStyle: [styles.content, style],
        keyboardShouldPersistTaps: 'handled'
    } : {
        style: [styles.content, style]
    };

    // Main component render
    const renderContent = () => (
        <ContentComponent {...contentProps}>
            {children}
        </ContentComponent>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Header
                title={title}
                subtitle={subtitle}
                showBackButton={showBackButton}
            />

            {keyboardAvoiding ? (
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    {renderContent()}
                </KeyboardAvoidingView>
            ) : (
                renderContent()
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 16,
    },
}); 
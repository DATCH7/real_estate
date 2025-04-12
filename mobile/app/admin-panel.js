import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/apiHelper';
import Header from '../components/Header';

export default function AdminPanelScreen() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadUsers();
        }
    }, [isAuthenticated, user]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiRequest('/api/users');

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                throw new Error('Received invalid data format');
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            setLoading(true);
            await apiRequest(`/api/users/role/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: newRole } : user
            ));

            Alert.alert('Success', `User role updated to ${newRole}`);
        } catch (error) {
            console.error('Failed to update user role:', error);
            Alert.alert('Error', 'Failed to update user role');
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this user? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await apiRequest(`/api/users/${userId}`, { method: 'DELETE' });
                            // Remove from local state
                            setUsers(users.filter(user => user._id !== userId));
                            Alert.alert('Success', 'User deleted successfully');
                        } catch (error) {
                            console.error('Failed to delete user:', error);
                            Alert.alert('Error', 'Failed to delete user');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const renderUserItem = ({ item }) => {
        return (
            <View style={styles.userCard}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <FontAwesome
                            name="user-circle"
                            size={40}
                            color={item.role === 'admin' ? '#d77710' : '#007AFF'}
                        />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                            {item.firstName} {item.lastName}
                        </Text>
                        <Text style={styles.userEmail}>
                            {item.email}
                        </Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>
                                {item.role === 'admin' ? 'Administrator' : 'Regular User'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.userActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => openUserModal(item)}
                    >
                        <FontAwesome name="edit" size={18} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteUser(item._id)}
                    >
                        <FontAwesome name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // If not authenticated or not an admin, redirect
    if (!isAuthenticated) {
        return <Redirect href="/" />;
    }

    if (isAuthenticated && user?.role !== 'admin') {
        return <Redirect href="/(tabs)" />;
    }

    // Filter users based on search query
    const filteredUsers = users.filter(item => {
        // Skip current admin
        if (item._id === user._id) return false;

        // If search query exists, filter by name or email
        if (searchQuery) {
            const matchesEmail = item.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesName = `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesEmail || matchesName;
        }

        return true;
    });

    const renderListContent = () => {
        if (loading && !users.length) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#d77710" />
                    <Text style={styles.loadingText}>Loading users...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContent}>
                    <FontAwesome name="exclamation-circle" size={40} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (filteredUsers.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="users" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Header
                title="Admin Panel"
                subtitle="Manage Users"
            />

            <View style={styles.searchBox}>
                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={18} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <FontAwesome name="times-circle" size={18} color="#666" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {renderListContent() || (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    style={styles.flatList}
                    refreshing={loading}
                    onRefresh={loadUsers}
                    initialNumToRender={10}
                />
            )}

            {/* User Action Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Manage User</Text>

                        {selectedUser && (
                            <View style={styles.modalUserInfo}>
                                <Text style={styles.modalUserName}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </Text>
                                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                                <Text style={styles.modalUserRole}>
                                    Current Role: <Text style={styles.roleBold}>{selectedUser.role}</Text>
                                </Text>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            {selectedUser?.role === 'admin' ? (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.demoteButton]}
                                    onPress={() => handleChangeRole(selectedUser._id, 'user')}
                                >
                                    <FontAwesome name="arrow-down" size={18} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Demote to Regular User</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.promoteButton]}
                                    onPress={() => handleChangeRole(selectedUser._id, 'admin')}
                                >
                                    <FontAwesome name="arrow-up" size={18} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Promote to Admin</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchBox: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    flatList: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 50, // Extra padding at bottom
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20,
    },
    retryButton: {
        backgroundColor: '#d77710',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    roleBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    userActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalUserInfo: {
        marginBottom: 20,
        alignItems: 'center',
    },
    modalUserName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalUserEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    modalUserRole: {
        fontSize: 14,
        color: '#666',
    },
    roleBold: {
        fontWeight: 'bold',
        color: '#333',
    },
    modalActions: {
        marginTop: 8,
    },
    modalButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoteButton: {
        backgroundColor: '#34C759',
    },
    demoteButton: {
        backgroundColor: '#d77710',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 
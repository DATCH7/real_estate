import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import ScreenLayout from '../../components/ScreenLayout';
import { fetchUserFavorites, toggleFavorite } from '../../utils/apiHelper';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { getPhotoUrl } from '../../utils/photoHelper';
import { PROPERTY_STYLES } from '../../constants/PropertyStyles';

const { cardWidth } = PROPERTY_STYLES;
const imageHeight = PROPERTY_STYLES.favoriteImageHeight;

export default function FavoritesScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [sortNewestFirst, setSortNewestFirst] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, [isAuthenticated]);

    const loadFavorites = async () => {
        try {
            if (!isAuthenticated) {
                setFavorites([]);
                setError('Please log in to view your favorites');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const data = await fetchUserFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setError('Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    const handleRemoveFavorite = async (propertyId) => {
        try {
            await toggleFavorite(propertyId, true);
            // Update favorites list by removing this property
            setFavorites(favorites.filter(item => item._id !== propertyId));
            Alert.alert('Success', 'Property removed from favorites');
        } catch (error) {
            console.error('Error removing from favorites:', error);
            Alert.alert('Error', 'Failed to remove from favorites');
        }
    };

    const handlePropertyPress = (propertyId) => {
        router.push(`/property-details?propertyId=${propertyId}`);
    };

    const renderItem = ({ item }) => {
        // Get first photo or placeholder
        const photoUrl = item.photos && item.photos.length > 0
            ? getPhotoUrl(item.photos[0])
            : 'https://via.placeholder.com/300x200?text=No+Image';

        return (
            <View style={styles.propertyCard}>
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => handlePropertyPress(item._id)}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: getPhotoUrl(item.propertyId.photos?.[0]) }}
                            style={styles.propertyImage}
                            resizeMode="cover"
                            onError={(e) => {
                                console.log('Error loading image:', e.nativeEvent.error);
                            }}
                        />
                    </View>

                    <View style={styles.propertyDetails}>
                        <Text style={styles.propertyTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.priceAndCategory}>
                            <Text style={styles.propertyPrice}>{item.price} DH</Text>
                            <View style={[
                                styles.categoryBadge,
                                { backgroundColor: item.category === 'rent' ? '#4285F4' : '#d77710' }
                            ]}>
                                <Text style={styles.categoryText}>
                                    {item.category === 'rent' ? 'For Rent' : 'For Sale'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.propertyLocation} numberOfLines={1}>
                            <FontAwesome name="map-marker" size={14} color="#666" /> {item.address || 'Location not specified'}
                        </Text>
                        <View style={styles.propertyFeatures}>
                            {item.surface && (
                                <Text style={styles.featureText}>
                                    <FontAwesome name="home" size={12} color="#666" /> {item.surface} m²
                                </Text>
                            )}
                            {item.rooms && (
                                <Text style={styles.featureText}>
                                    <FontAwesome name="bed" size={12} color="#666" /> {item.rooms} {parseInt(item.rooms) > 1 ? 'rooms' : 'room'}
                                </Text>
                            )}
                        </View>

                        {item.addedAt && (
                            <Text style={styles.favoriteDate}>
                                <FontAwesome name="clock-o" size={10} color="#999" /> Added {new Date(item.addedAt).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(item._id)}
                >
                    <FontAwesome name="trash" size={18} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="star-o" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyMessage}>
                Properties you favorite will appear here for easy access
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/properties-for-sale')}
            >
                <Text style={styles.browseButtonText}>Browse Properties</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <ScreenLayout title="Favorites" scrollable={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#d77710" />
                    <Text style={styles.loadingText}>Loading your favorites...</Text>
                </View>
            </ScreenLayout>
        );
    }

    if (error && !isAuthenticated) {
        return (
            <ScreenLayout title="Favorites" scrollable={false}>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="user-o" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>Login Required</Text>
                    <Text style={styles.emptyMessage}>
                        Please login to view and manage your favorites
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.browseButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout title="My Favorites" scrollable={false}>
            {favorites.length > 0 && (
                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => setSortNewestFirst(!sortNewestFirst)}
                    >
                        <Text style={styles.sortButtonText}>
                            {sortNewestFirst ? 'Newest First' : 'Oldest First'}
                        </Text>
                        <FontAwesome
                            name={sortNewestFirst ? 'sort-amount-desc' : 'sort-amount-asc'}
                            size={16}
                            color="#fff"
                            style={{ marginLeft: 8 }}
                        />
                    </TouchableOpacity>
                </View>
            )}
            <FlatList
                data={favorites.sort((a, b) => {
                    const dateA = new Date(a.addedAt);
                    const dateB = new Date(b.addedAt);
                    return sortNewestFirst ? dateB - dateA : dateA - dateB;
                })}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d77710']} />
                }
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: PROPERTY_STYLES.cardMargin,
        paddingBottom: 30,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: PROPERTY_STYLES.textMedium,
        fontSize: PROPERTY_STYLES.bodySize,
    },
    propertyCard: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: PROPERTY_STYLES.cardBorderRadius,
        marginBottom: 16,
        shadowColor: PROPERTY_STYLES.shadowColor,
        shadowOffset: PROPERTY_STYLES.shadowOffset,
        shadowOpacity: PROPERTY_STYLES.shadowOpacity,
        shadowRadius: PROPERTY_STYLES.shadowRadius,
        elevation: PROPERTY_STYLES.elevation,
        flexDirection: 'row',
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
    },
    imageContainer: {
        width: imageHeight,
        height: imageHeight,
    },
    propertyImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: PROPERTY_STYLES.cardBorderRadius,
        borderBottomLeftRadius: PROPERTY_STYLES.cardBorderRadius,
    },
    propertyDetails: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
        minHeight: imageHeight,
    },
    propertyTitle: {
        fontSize: PROPERTY_STYLES.subtitleSize,
        fontWeight: 'bold',
        color: PROPERTY_STYLES.textDark,
        marginBottom: 4,
    },
    propertyPrice: {
        fontSize: PROPERTY_STYLES.subtitleSize,
        fontWeight: 'bold',
        color: PROPERTY_STYLES.primaryColor,
    },
    propertyLocation: {
        fontSize: PROPERTY_STYLES.bodySize,
        color: PROPERTY_STYLES.textMedium,
        marginBottom: 6,
    },
    propertyFeatures: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    featureText: {
        fontSize: PROPERTY_STYLES.smallSize,
        color: PROPERTY_STYLES.textMedium,
        marginRight: 8,
    },
    removeButton: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: PROPERTY_STYLES.textDark,
        marginTop: 20,
        marginBottom: 10,
    },
    emptyMessage: {
        fontSize: PROPERTY_STYLES.bodySize,
        color: PROPERTY_STYLES.textMedium,
        textAlign: 'center',
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: PROPERTY_STYLES.primaryColor,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: PROPERTY_STYLES.subtitleSize,
    },
    priceAndCategory: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: PROPERTY_STYLES.smallSize,
        fontWeight: 'bold',
        color: '#fff',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: PROPERTY_STYLES.cardMargin,
    },
    sortButton: {
        backgroundColor: PROPERTY_STYLES.primaryColor,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: PROPERTY_STYLES.subtitleSize,
    },
    favoriteDate: {
        fontSize: PROPERTY_STYLES.smallSize,
        color: PROPERTY_STYLES.textLight,
        marginTop: 4,
    },
}); 
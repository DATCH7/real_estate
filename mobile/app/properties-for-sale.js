import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/ScreenLayout';
import { fetchPropertiesForSale, toggleFavorite } from '../utils/apiHelper';
import { getPhotoUrl } from '../utils/photoHelper';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9; // Each card takes 90% of screen width

export default function PropertiesForSaleScreen() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [properties, setProperties] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            console.log('Loading properties for sale...');
            const data = await fetchPropertiesForSale();

            console.log(`Fetched ${data.length} properties for sale`);

            // Log the first property to see its structure
            if (data.length > 0) {
                console.log('Sample property data:', JSON.stringify(data[0], null, 2));
            }

            setProperties(data);

            // Initialize favorites state
            const initialFavorites = {};
            data.forEach(property => {
                initialFavorites[property._id] = false;
            });
            setFavorites(initialFavorites);
        } catch (error) {
            console.error('Error loading properties:', error);
            Alert.alert('Error', 'Failed to load properties: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (propertyId) => {
        if (!isAuthenticated) {
            Alert.alert(
                'Login Required',
                'You need to be logged in to favorite properties',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/') }
                ]
            );
            return;
        }

        try {
            const isFavorited = favorites[propertyId];

            // Use the helper function to toggle favorite status
            await toggleFavorite(propertyId, isFavorited);

            // Toggle favorite status locally
            setFavorites(prev => ({
                ...prev,
                [propertyId]: !isFavorited,
            }));

            // Show feedback to user
            Alert.alert(
                'Success',
                isFavorited
                    ? 'Property removed from favorites'
                    : 'Property added to favorites'
            );
        } catch (error) {
            console.error('Error updating favorites:', error);
            Alert.alert('Error', 'Failed to update favorites: ' + error.message);
        }
    };

    const renderProperty = ({ item }) => {
        // For debugging
        console.log('Rendering property:', item._id, item.title);

        // Handle case where photos array might be empty or formatted differently
        let photoUrl = getPhotoUrl(item.photos && item.photos.length > 0 ? item.photos[0] : null);

        console.log('Using photo URL:', photoUrl);

        return (
            <View style={styles.propertyCard}>
                <Image
                    source={{ uri: getPhotoUrl(item.photos?.[0]) }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                    onError={(e) => {
                        console.log('Error loading image:', e.nativeEvent.error);
                    }}
                />

                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleFavorite(item._id)}
                >
                    <FontAwesome
                        name={favorites[item._id] ? "star" : "star-o"}
                        size={24}
                        color={favorites[item._id] ? "#FFD700" : "#666"}
                    />
                </TouchableOpacity>

                <View style={styles.propertyDetails}>
                    <Text style={styles.propertyTitle}>{item.title || 'No Title'}</Text>
                    <Text style={styles.propertyDescription} numberOfLines={2}>
                        {item.description || 'No description available'}
                    </Text>

                    <View style={styles.propertyFeatures}>
                        <View style={styles.featureItem}>
                            <FontAwesome name="money" size={16} color="#666" />
                            <Text style={styles.featureText}>{item.price || 'N/A'} DH</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <FontAwesome name="home" size={16} color="#666" />
                            <Text style={styles.featureText}>{item.surface || 'N/A'} m²</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <FontAwesome name="bed" size={16} color="#666" />
                            <Text style={styles.featureText}>
                                {item.rooms || 'N/A'} {item.rooms && parseInt(item.rooms) > 1 ? 'Rooms' : 'Room'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.propertyType}>
                        Type: {item.type || 'Not specified'}
                    </Text>

                    <Text style={styles.propertyAddress}>
                        <FontAwesome name="map-marker" size={16} color="#666" /> {item.address || 'Address not available'}
                    </Text>

                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => {
                            console.log('View details for property:', item._id);
                            // Navigate to the property details screen
                            router.push({
                                pathname: '/property-details',
                                params: { propertyId: item._id }
                            });
                        }}
                    >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenLayout
                title="Properties For Sale"
                subtitle="Find your dream property"
                scrollable={false}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#d77710" />
                    <Text style={styles.loadingText}>Loading properties...</Text>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout
            title="Properties For Sale"
            subtitle="Find your dream property"
            scrollable={false}
            style={styles.screenContent}
        >
            {properties.length > 0 ? (
                <FlatList
                    data={properties}
                    renderItem={renderProperty}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={true}
                    style={styles.flatList}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="home" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No properties available for sale</Text>
                    {isAuthenticated && (
                        <TouchableOpacity
                            style={styles.publishButton}
                            onPress={() => router.push('/publish-property')}
                        >
                            <Text style={styles.publishButtonText}>Publish a Property</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    screenContent: {
        padding: 0,
        flex: 1,
    },
    flatList: {
        flex: 1,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    propertyCard: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    propertyImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    propertyDetails: {
        padding: 15,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    propertyDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    propertyFeatures: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 6,
    },
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    propertyType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    propertyAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    detailsButton: {
        backgroundColor: '#d77710',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    publishButton: {
        backgroundColor: '#d77710',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 
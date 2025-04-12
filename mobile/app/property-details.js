import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Linking,
    Share,
    Alert,
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, toggleFavorite, fetchPropertyById } from '../utils/apiHelper';
import { getPhotoUrl } from '../utils/photoHelper';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
    const { propertyId } = useLocalSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (propertyId) {
            fetchPropertyDetails();
        } else {
            setError('No property ID provided');
            setLoading(false);
        }
    }, [propertyId]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);

            console.log(`Fetching details for property ID: ${propertyId}`);

            // Use the fetchPropertyById function which handles the server's API structure
            const data = await fetchPropertyById(propertyId);

            if (!data) {
                console.error('Property data is null or undefined');
                setError('Property data could not be retrieved. Please try again.');
                setLoading(false);
                return;
            }

            console.log('Property details fetched successfully:',
                `ID: ${data._id}, Title: ${data.title}, Category: ${data.category}`);

            // Debug log for property data
            console.log('Debug - Property agent data:', {
                agentId: data.agentId,
                publisherName: data.publisherName,
                publisherEmail: data.publisherEmail,
                publisherPhone: data.publisherPhone
            });

            // Log all property keys for debugging
            console.log('Property data keys:', Object.keys(data));

            setProperty(data);

            // Check if property is in user's favorites (if authenticated)
            if (isAuthenticated) {
                try {
                    console.log('Checking if property is in favorites...');
                    try {
                        const favoritesResponse = await apiRequest('/api/favorites');

                        if (Array.isArray(favoritesResponse)) {
                            const isFav = favoritesResponse.some(fav => fav.property === propertyId);
                            console.log(`Property favorite status: ${isFav ? 'Favorited' : 'Not favorited'}`);
                            setIsFavorite(isFav);
                        } else if (favoritesResponse && favoritesResponse.message === 'No favorites found.') {
                            // This is an expected response when user has no favorites
                            console.log('User has no favorites yet');
                            setIsFavorite(false);
                        } else {
                            console.warn('Unexpected favorites response format:', favoritesResponse);
                            // Don't update isFavorite state in this case
                        }
                    } catch (favError) {
                        if (favError.message && favError.message.includes('404')) {
                            // 404 is expected if the user has no favorites yet
                            console.log('No favorites found (404 response)');
                            setIsFavorite(false);
                        } else {
                            console.error('Error checking favorites:', favError);
                        }
                    }
                } catch (outerError) {
                    console.error('Outer error in favorites check:', outerError);
                    // Don't fail the whole operation if favorites check fails
                }
            } else {
                console.log('User not authenticated, skipping favorites check');
            }
        } catch (err) {
            console.error('Failed to fetch property details:', err);
            setError(`Failed to load property details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = async () => {
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
            await toggleFavorite(propertyId, isFavorite);
            setIsFavorite(!isFavorite);

            Alert.alert(
                'Success',
                isFavorite
                    ? 'Property removed from favorites'
                    : 'Property added to favorites'
            );
        } catch (error) {
            console.error('Error updating favorites:', error);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const handleCall = (phone) => {
        if (!phone) {
            Alert.alert('Error', 'No phone number available');
            return;
        }

        const phoneUrl = `tel:${phone}`;
        Linking.canOpenURL(phoneUrl)
            .then(supported => {
                if (supported) {
                    return Linking.openURL(phoneUrl);
                } else {
                    Alert.alert('Error', 'Phone calls are not supported on this device');
                }
            })
            .catch(err => {
                console.error('Error making phone call:', err);
                Alert.alert('Error', 'Could not make phone call');
            });
    };

    const handleShare = async () => {
        if (!property) return;

        try {
            const result = await Share.share({
                message: `Check out this ${property.category === 'rent' ? 'rental' : 'property for sale'}: ${property.title} - ${property.price} DH`,
                url: `${API_URL}/properties/${propertyId}`,
                title: `${property.title} - Real Estate App`
            });

            if (result.action === Share.sharedAction) {
                console.log('Shared successfully');
            }
        } catch (error) {
            console.error('Error sharing property:', error);
            Alert.alert('Error', 'Could not share property');
        }
    };

    const nextImage = () => {
        if (property?.photos?.length > 0) {
            setCurrentImageIndex((currentImageIndex + 1) % property.photos.length);
        }
    };

    const prevImage = () => {
        if (property?.photos?.length > 0) {
            setCurrentImageIndex((currentImageIndex - 1 + property.photos.length) % property.photos.length);
        }
    };

    if (loading) {
        return (
            <ScreenLayout
                title="Property Details"
                subtitle="Loading..."
                scrollable={false}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#d77710" />
                    <Text style={styles.loadingText}>Loading property details...</Text>
                </View>
            </ScreenLayout>
        );
    }

    if (error) {
        return (
            <ScreenLayout
                title="Error"
                subtitle="Something went wrong"
                scrollable={false}
            >
                <View style={styles.errorContainer}>
                    <FontAwesome name="exclamation-triangle" size={64} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenLayout>
        );
    }

    if (!property) {
        return (
            <ScreenLayout
                title="Not Found"
                subtitle="Property not found"
                scrollable={false}
            >
                <View style={styles.errorContainer}>
                    <FontAwesome name="search" size={64} color="#999" />
                    <Text style={styles.errorText}>Property could not be found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenLayout>
        );
    }

    const currentPhoto = property.photos && property.photos.length > 0
        ? getPhotoUrl(property.photos[currentImageIndex])
        : 'https://placehold.co/300x200/gray/white?text=No+Image';

    return (
        <ScreenLayout
            title={property.title || 'Property Details'}
            subtitle={property.category === 'rent' ? 'For Rent' : 'For Sale'}
            scrollable={true}
            showBackButton={true}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: currentPhoto }}
                        style={styles.propertyImage}
                        resizeMode="cover"
                        onError={(e) => {
                            console.log('Error loading image:', e.nativeEvent.error);
                        }}
                    />

                    {property.photos && property.photos.length > 1 && (
                        <View style={styles.imageNavigation}>
                            <TouchableOpacity onPress={prevImage} style={styles.imageNavButton}>
                                <FontAwesome name="chevron-left" size={20} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.imageCounter}>
                                {currentImageIndex + 1} / {property.photos.length}
                            </Text>

                            <TouchableOpacity onPress={nextImage} style={styles.imageNavButton}>
                                <FontAwesome name="chevron-right" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoriteToggle}
                    >
                        <FontAwesome
                            name={isFavorite ? "star" : "star-o"}
                            size={24}
                            color={isFavorite ? "#FFD700" : "#fff"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                    >
                        <FontAwesome name="share-alt" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Property Title and Price */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{property.title || 'Unnamed Property'}</Text>
                    <Text style={styles.price}>
                        {property.price || 'N/A'} DH
                        {property.category === 'rent' ? '/month' : ''}
                    </Text>
                </View>

                {/* Property Main Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureBox}>
                        <FontAwesome name="home" size={20} color="#d77710" />
                        <Text style={styles.featureValue}>{property.surface || 'N/A'}</Text>
                        <Text style={styles.featureLabel}>m²</Text>
                    </View>

                    <View style={styles.featureBox}>
                        <FontAwesome name="bed" size={20} color="#d77710" />
                        <Text style={styles.featureValue}>{property.rooms || 'N/A'}</Text>
                        <Text style={styles.featureLabel}>
                            {property.rooms && parseInt(property.rooms) > 1 ? 'Rooms' : 'Room'}
                        </Text>
                    </View>

                    <View style={styles.featureBox}>
                        <FontAwesome name="building" size={20} color="#d77710" />
                        <Text style={styles.featureValue}>{property.type || 'N/A'}</Text>
                        <Text style={styles.featureLabel}>Type</Text>
                    </View>
                </View>

                {/* Property Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {property.description || 'No description available.'}
                    </Text>
                </View>

                {/* Property Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.addressContainer}>
                        <FontAwesome name="map-marker" size={20} color="#d77710" />
                        <Text style={styles.address}>
                            {property.address || 'Address not available'}
                        </Text>
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>
                                {property.category === 'rent' ? 'For Rent' : 'For Sale'}
                            </Text>
                        </View>

                        {property.equipment && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Equipment</Text>
                                <Text style={styles.detailValue}>{property.equipment}</Text>
                            </View>
                        )}

                        {property.diagnostics && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Diagnostics</Text>
                                <Text style={styles.detailValue}>{property.diagnostics}</Text>
                            </View>
                        )}

                        {/* Add any additional property details here */}
                    </View>
                </View>

                {/* Owner/Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.contactInfo}>
                        {property.publisherName ? (
                            <Text style={styles.contactName}>
                                <FontAwesome name="user" size={16} color="#d77710" /> {property.publisherName}
                            </Text>
                        ) : null}

                        {property.publisherPhone && property.publisherPhone !== "Not available" ? (
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => handleCall(property.publisherPhone)}
                            >
                                <FontAwesome name="phone" size={20} color="#fff" />
                                <Text style={styles.callButtonText}>Call: {property.publisherPhone}</Text>
                            </TouchableOpacity>
                        ) : null}

                        {property.publisherEmail && property.publisherEmail !== "contact@realestate.com" ? (
                            <TouchableOpacity
                                style={[styles.callButton, styles.emailButton]}
                                onPress={() => Linking.openURL(`mailto:${property.publisherEmail}`)}
                            >
                                <FontAwesome name="envelope" size={20} color="#fff" />
                                <Text style={styles.callButtonText}>Email: {property.publisherEmail}</Text>
                            </TouchableOpacity>
                        ) : null}

                        {/* Debug info - to help troubleshoot contact info issues */}
                        <Text style={{ marginTop: 15, fontSize: 12, color: '#999', textAlign: 'center' }}>
                            Property ID: {property._id}
                        </Text>
                    </View>
                </View>

                {/* Publication Date */}
                {property.createdAt && (
                    <Text style={styles.publicationDate}>
                        Published on: {new Date(property.createdAt).toLocaleDateString()}
                    </Text>
                )}
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 0,
        paddingBottom: 30,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        backgroundColor: '#d77710',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 250,
        backgroundColor: '#f0f0f0',
    },
    propertyImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    imageNavigation: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageNavButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    imageCounter: {
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        fontSize: 14,
        fontWeight: 'bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButton: {
        position: 'absolute',
        top: 10,
        right: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d77710',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#f9f9f9',
    },
    featureBox: {
        alignItems: 'center',
    },
    featureValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    featureLabel: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    address: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        width: '50%',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#999',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    contactInfo: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
    },
    contactName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    callButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    callButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    emailButton: {
        backgroundColor: '#4285F4',
        marginTop: 10,
    },
    noContactInfo: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    noContactContainer: {
        alignItems: 'center',
        padding: 16,
    },
    noContactSubInfo: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    publicationDate: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
}); 
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Consistent dimensions for property cards
export const PROPERTY_STYLES = {
    // Card dimensions
    cardWidth: width - 32, // Full width minus standard padding
    cardMargin: 16,
    cardBorderRadius: 10,

    // Image dimensions
    listImageHeight: 200, // Standard height for property list images
    favoriteImageHeight: 120, // Height for favorite property images

    // Content dimensions
    detailsMinHeight: 150, // Minimum height for property details section

    // Elevation and shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,

    // Colors
    primaryColor: '#d77710', // App's primary orange color
    secondaryColor: '#4285F4', // Blue color for rent properties
    textDark: '#333',
    textMedium: '#666',
    textLight: '#999',

    // Text sizes
    titleSize: 18,
    subtitleSize: 16,
    bodySize: 14,
    smallSize: 12,
};

// Helper function to get price tag styling
export const getPriceTagStyle = (isRent = false) => ({
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: isRent
        ? 'rgba(66, 133, 244, 0.9)' // Blue for rent
        : 'rgba(215, 119, 16, 0.9)', // Orange for sale
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
});

export default PROPERTY_STYLES; 
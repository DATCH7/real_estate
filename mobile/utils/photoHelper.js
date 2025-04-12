import { Platform } from 'react-native';
import { API_URL } from '../config';

/**
 * Helper function to get the correct photo URL
 * @param {string|object|null} photo - The photo to process, can be string path, object with uri, or null
 * @param {Object} options - Optional configuration
 * @param {boolean} options.debug - Whether to log debug information
 * @param {string} options.placeholder - Custom placeholder URL
 * @returns {string} - The complete URL to the photo or a placeholder image
 */
export const getPhotoUrl = (photo, options = {}) => {
    const debug = options.debug === undefined ? true : options.debug;
    const placeholderUrl = options.placeholder || 'https://placehold.co/300x200/gray/white?text=No+Image';

    if (debug) console.log('Processing photo URL:', photo);

    // Handle null or undefined photo
    if (!photo) {
        if (debug) console.log('No photo provided, using placeholder');
        return placeholderUrl;
    }

    // If photo is already a complete URL
    if (typeof photo === 'string') {
        // Check if it's already a valid URL
        if (photo.startsWith('http://') || photo.startsWith('https://')) {
            if (debug) console.log('Using existing full URL:', photo);
            return photo;
        }

        // Check if it's a relative path to uploads
        if (photo.startsWith('/uploads/')) {
            const fullUrl = `${API_URL}${photo}`;
            if (debug) console.log('Converting relative uploads path to full URL:', fullUrl);
            return fullUrl;
        }

        // Assume it's just a filename and construct a path to the uploads directory
        const fullUrl = `${API_URL}/uploads/${photo}`;
        if (debug) console.log('Constructed uploads URL:', fullUrl);
        return fullUrl;
    }

    // Handle image picker result (object with uri property)
    if (photo && photo.uri) {
        if (debug) console.log('Using photo URI from object:', photo.uri);
        return photo.uri;
    }

    // Handle case where photo is an array (first item)
    if (Array.isArray(photo) && photo.length > 0) {
        if (debug) console.log('Photo is an array, using first item');
        return getPhotoUrl(photo[0], { ...options, debug: false });
    }

    // If we reach here, we couldn't process the photo
    if (debug) console.log('Unable to process photo, using placeholder');
    return placeholderUrl;
};

/**
 * Helper function to help debug photo URL issues
 * @param {string} filename - Filename to test
 */
export const debugPhotoUrl = (filename) => {
    console.log('------- Photo URL Debug -------');
    console.log(`Platform: ${Platform.OS}`);
    console.log(`API URL: ${API_URL}`);

    if (filename) {
        console.log(`Testing with filename: ${filename}`);
        const url = getPhotoUrl(filename, { debug: false });
        console.log(`Constructed URL: ${url}`);

        // Test different formats
        console.log('Testing with different formats:');
        console.log(`- Full URL: ${getPhotoUrl(`http://example.com/${filename}`, { debug: false })}`);
        console.log(`- Relative path: ${getPhotoUrl(`/uploads/${filename}`, { debug: false })}`);
        console.log(`- URI object: ${getPhotoUrl({ uri: `file:///${filename}` }, { debug: false })}`);
    } else {
        console.log('No filename provided for testing');
    }

    console.log('-------------------------------');
}; 
import { API_URL } from '../config';
import { Platform } from 'react-native';

/**
 * Helper functions for API calls to ensure consistent endpoint usage
 */

// Network logger for debugging API calls
const logApiCall = async (url, options, startTime) => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`📡 API ${options.method} ${url}`);
    console.log(`⏱️ Duration: ${duration}ms`);

    if (options.body) {
        try {
            // For FormData logging, show a summary instead of full content
            if (options.body instanceof FormData) {
                console.log('📦 Request Body: [FormData]');
                for (let pair of options.body.entries()) {
                    if (pair[0] === 'photo') {
                        console.log(`  - ${pair[0]}: [File/Blob]`);
                    } else {
                        console.log(`  - ${pair[0]}: ${pair[1]}`);
                    }
                }
            } else if (typeof options.body === 'string') {
                // Try to parse JSON string for better logging
                try {
                    const bodyObj = JSON.parse(options.body);
                    console.log('📦 Request Body:', bodyObj);
                } catch {
                    console.log('📦 Request Body:', options.body);
                }
            } else {
                console.log('📦 Request Body:', options.body);
            }
        } catch (e) {
            console.log('📦 Request Body: [Error parsing body]');
        }
    }

    return { startTime, endTime, duration };
};

const logApiResponse = async (response, timing, responseBody = null) => {
    console.log(`🔄 Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️ Request completed in ${timing.duration}ms`);

    if (responseBody) {
        try {
            console.log('📄 Response:', typeof responseBody === 'string' ?
                (responseBody.length > 500 ? responseBody.substring(0, 500) + '...' : responseBody) :
                responseBody);
        } catch (e) {
            console.log('📄 Response: [Error parsing response]');
        }
    }

    // Add a line break for readability in logs
    console.log('\n');
};

// Enhanced fetch with logging
async function fetchWithLogging(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    const startTime = Date.now();

    try {
        const timing = await logApiCall(fullUrl, options, startTime);
        const response = await fetch(fullUrl, options);

        // Clone the response to read it twice
        const responseClone = response.clone();

        // Try to get the response body for logging
        let responseBody = null;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseBody = await responseClone.json();
            } else {
                responseBody = await responseClone.text();
            }
        } catch (e) {
            console.log('🔴 Error reading response body:', e.message);
        }

        await logApiResponse(response, timing, responseBody);

        if (!response.ok) {
            const errorText = typeof responseBody === 'string' ? responseBody :
                (responseBody ? JSON.stringify(responseBody) : 'Unknown error');
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        return response;
    } catch (error) {
        console.log(`🔴 API Error: ${error.message}`);
        throw error;
    }
}

// Fetch properties (sale or rent)
export async function fetchProperties(type) {
    try {
        console.log(`Fetching ${type} properties from ${API_URL}/api/properties/${type}...`);
        const response = await fetchWithLogging(`/api/properties/${type}`);
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} ${type} properties`);
        return data;
    } catch (error) {
        console.error(`Error fetching ${type} properties:`, error);
        throw error;
    }
}

// Publish a property
export async function publishProperty(propertyData) {
    try {
        console.log('Publishing property with data...');

        // Check if propertyData is already a FormData object
        let formDataToSend;
        if (propertyData instanceof FormData) {
            formDataToSend = propertyData;
        } else {
            // Create a new FormData object
            formDataToSend = new FormData();

            // Add text fields to FormData
            Object.keys(propertyData).forEach(key => {
                if (key !== 'photos') {
                    formDataToSend.append(key, propertyData[key]);
                }
            });

            // Add photos if they exist
            if (propertyData.photos && Array.isArray(propertyData.photos)) {
                propertyData.photos.forEach((photo, index) => {
                    // If it's a file object with uri
                    if (photo.uri) {
                        const fileName = photo.fileName || `photo_${index}.jpg`;
                        const fileType = photo.type || 'image/jpeg';
                        const uri = Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri;

                        formDataToSend.append('photos', {
                            uri,
                            name: fileName,
                            type: fileType
                        });
                        console.log(`Appending photo ${index} from URI: ${uri.substring(0, 30)}...`);
                    } else if (typeof photo === 'string') {
                        // If it's a string (URL or path)
                        formDataToSend.append('photos', photo);
                        console.log(`Appending photo ${index} as string`);
                    }
                });
            }
        }

        // Log what we're sending to help debug
        console.log('FormData created with the following entries:');
        if (formDataToSend._parts) {
            formDataToSend._parts.forEach((part, index) => {
                if (part[0] === 'photos') {
                    console.log(`FormData entry ${index}: ${part[0]} = [File object]`);
                } else {
                    console.log(`FormData entry ${index}: ${part[0]} = ${part[1]}`);
                }
            });
        }

        // Send the request with proper content type header
        const response = await fetchWithLogging('/api/properties', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                // Don't set Content-Type when using FormData, let browser set it with boundary
            },
            body: formDataToSend,
        });

        // Parse the response
        const result = await response.json();
        console.log('Property published successfully:', result);
        return result;
    } catch (error) {
        console.error('Error publishing property:', error);

        // Provide more detailed error message
        if (error.message && error.message.includes('500')) {
            throw new Error('Server error while publishing property. Please check your image files and try again with smaller images.');
        }

        throw error;
    }
}

// Fetch user data
export async function fetchUserData() {
    try {
        console.log('Fetching user data...');
        const response = await fetchWithLogging('/api/getUserData', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('User data fetched successfully');
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// A general purpose fetch API function that other components can use
export async function apiRequest(endpoint, options = {}) {
    try {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                ...(!options.body || options.body instanceof FormData ? {} : {
                    'Content-Type': 'application/json'
                }),
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetchWithLogging(endpoint, mergedOptions);

        // For HEAD or OPTIONS requests, we don't try to parse the body
        if (mergedOptions.method === 'HEAD' || mergedOptions.method === 'OPTIONS') {
            return { ok: response.ok, status: response.status, headers: response.headers };
        }

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            } else {
                const text = await response.text();
                return text;
            }
        } catch (error) {
            console.error('Error parsing API response:', error);
            const text = await response.text();
            return text;
        }
    } catch (error) {
        console.error(`API Request failed:`, error);
        throw error;
    }
}

// Function to fetch a single property by ID
export async function fetchPropertyById(propertyId) {
    try {
        console.log(`Fetching property with ID: ${propertyId}`);

        // The server doesn't have a direct /properties/:id endpoint,
        // so we'll fetch all properties and filter for the one we want
        const response = await fetchWithLogging('/api/properties');
        const data = await response.json();

        // Find the property with the matching ID
        const property = data.find(p => p._id === propertyId);

        if (!property) {
            throw new Error(`Property with ID ${propertyId} not found`);
        }

        console.log('Property details found:', property.title);
        console.log('Raw property data:', JSON.stringify(property).substring(0, 500) + '...');
        console.log('Agent ID from property:', property.agentId);

        // If property has an agentId, we'll try to fetch the publisher's contact info
        if (property.agentId) {
            try {
                console.log('Starting publisher lookup for agentId:', property.agentId);
                // Get all users to search for our specific agent
                const usersResponse = await fetchWithLogging('/api/users');
                const usersData = await usersResponse.json();

                console.log(`Fetched ${usersData.length} users for publisher lookup`);

                // Debug first few users to see their structure
                if (usersData.length > 0) {
                    const sampleUser = usersData[0];
                    console.log('Sample user structure:', {
                        id: sampleUser._id,
                        name: `${sampleUser.firstName} ${sampleUser.lastName}`,
                        hasPhone: !!sampleUser.phone,
                        phoneType: typeof sampleUser.phone,
                        hasEmail: !!sampleUser.email
                    });
                }

                // Find the publisher directly
                const publisher = usersData.find(user =>
                    user._id === property.agentId ||
                    (user._id.toString && user._id.toString() === property.agentId.toString())
                );

                if (publisher) {
                    console.log(`Found publisher: ${publisher.firstName} ${publisher.lastName}`);
                    console.log('Publisher data:', JSON.stringify(publisher).substring(0, 300));

                    // Fix missing phone issue if necessary
                    let publisherPhone = publisher.phone;
                    if (!publisherPhone || publisherPhone === 'undefined' || publisherPhone === 'null') {
                        console.log('Publisher phone is missing or invalid, setting default from signup data');
                        // Try to use a default phone if we can't find one
                        publisherPhone = '0612345678'; // Default phone as fallback
                    } else {
                        console.log(`Found valid publisher phone: ${publisherPhone}`);
                    }

                    // Add publisher contact info to the property object
                    property.publisherName = `${publisher.firstName} ${publisher.lastName}`;
                    property.publisherEmail = publisher.email || 'contact@realestate.com';
                    property.publisherPhone = publisherPhone;

                    console.log('Updated property with publisher contact info:', {
                        publisherName: property.publisherName,
                        publisherEmail: property.publisherEmail,
                        publisherPhone: property.publisherPhone
                    });
                } else {
                    console.log(`Publisher with ID ${property.agentId} not found in users list`);

                    // Use the admin contact information as fallback
                    const adminUser = usersData.find(user => user.role === 'admin');
                    if (adminUser) {
                        console.log('Using admin user as fallback contact');
                        property.publisherName = `${adminUser.firstName} ${adminUser.lastName} (Admin)`;
                        property.publisherEmail = adminUser.email;
                        property.publisherPhone = adminUser.phone || '0612345678';
                    } else {
                        console.log('No admin user found, using default contact');
                        property.publisherName = "Property Agent";
                        property.publisherEmail = "contact@realestate.com";
                        property.publisherPhone = "0612345678";
                    }
                }
            } catch (userError) {
                console.error('Error fetching publisher data:', userError);
                // Set default values if we encounter an error
                property.publisherName = "Real Estate Agent";
                property.publisherEmail = "contact@realestate.com";
                property.publisherPhone = "0612345678";
            }
        } else {
            console.log('Property has no agentId, using default contact values');

            // Set default values for the publisher contact info
            property.publisherName = "Property Agent";
            property.publisherEmail = "contact@realestate.com";
            property.publisherPhone = "0612345678";
        }

        // Log the final property object with contact info
        console.log('Final property object with contact info:', {
            title: property.title,
            hasPublisherName: !!property.publisherName,
            hasPublisherEmail: !!property.publisherEmail,
            hasPublisherPhone: !!property.publisherPhone,
            publisherPhone: property.publisherPhone
        });

        return property;
    } catch (error) {
        console.error(`Error fetching property details:`, error);
        throw error;
    }
}

// Properties API
export const fetchPropertiesForSale = async () => {
    try {
        console.log(`Fetching properties for sale from: ${API_URL}/api/properties/category/sell`);

        // Route should match server's '/api/properties/category/sell' endpoint
        const response = await fetch(`${API_URL}/api/properties/category/sell`, {
            credentials: 'include',
        });

        console.log('Properties response status:', response.status);

        if (!response.ok) {
            console.log('Category endpoint failed, trying generic endpoint');
            // If category endpoint fails, try generic properties endpoint
            const allPropertiesResponse = await fetch(`${API_URL}/api/properties`, {
                credentials: 'include',
            });

            console.log('Generic properties endpoint status:', allPropertiesResponse.status);

            if (!allPropertiesResponse.ok) {
                const responseText = await allPropertiesResponse.text();
                console.error('Error response:', responseText.substring(0, 200));
                throw new Error(`Failed to fetch properties: ${allPropertiesResponse.status}`);
            }

            const allData = await allPropertiesResponse.json();
            console.log(`Fetched ${allData.length} total properties, filtering for sale`);

            // Filter for properties with sell category
            const filteredData = allData.filter(property =>
                property.category === 'sell' || property.category === 'Sell'
            );

            console.log(`Found ${filteredData.length} properties for sale after filtering`);
            return filteredData;
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} properties for sale`);
        return data;
    } catch (error) {
        console.error('Error fetching properties for sale:', error);
        throw error;
    }
};

export const fetchPropertiesForRent = async () => {
    try {
        console.log(`Fetching properties for rent from: ${API_URL}/api/properties/category/rent`);

        // Route should match server's '/api/properties/category/rent' endpoint
        const response = await fetch(`${API_URL}/api/properties/category/rent`, {
            credentials: 'include',
        });

        console.log('Properties response status:', response.status);

        if (!response.ok) {
            console.log('Category endpoint failed, trying generic endpoint');
            // If category endpoint fails, try generic properties endpoint
            const allPropertiesResponse = await fetch(`${API_URL}/api/properties`, {
                credentials: 'include',
            });

            console.log('Generic properties endpoint status:', allPropertiesResponse.status);

            if (!allPropertiesResponse.ok) {
                const responseText = await allPropertiesResponse.text();
                console.error('Error response:', responseText.substring(0, 200));
                throw new Error(`Failed to fetch properties: ${allPropertiesResponse.status}`);
            }

            const allData = await allPropertiesResponse.json();
            console.log(`Fetched ${allData.length} total properties, filtering for rent`);

            // Filter for properties with rent category
            const filteredData = allData.filter(property =>
                property.category === 'rent' || property.category === 'Rent'
            );

            console.log(`Found ${filteredData.length} properties for rent after filtering`);
            return filteredData;
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} properties for rent`);
        return data;
    } catch (error) {
        console.error('Error fetching properties for rent:', error);
        throw error;
    }
};

// Favorites API
export const toggleFavorite = async (propertyId, isFavorited) => {
    try {
        const method = isFavorited ? 'DELETE' : 'POST';
        console.log(`${method} favorite for property ${propertyId} to: ${API_URL}/api/favorite`);

        // Route should match server's '/api/favorite' endpoint
        const response = await fetch(`${API_URL}/api/favorite`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ propertyId }),
        });

        console.log('Favorite response status:', response.status);

        if (!response.ok) {
            const responseText = await response.text();
            console.error('Error response:', responseText.substring(0, 200));
            throw new Error(`Failed to update favorite: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating favorite:', error);
        throw error;
    }
};

// Fetch user by ID
export async function fetchUserById(userId) {
    try {
        console.log(`Fetching user with ID: ${userId}`);

        // The routes are mounted under /api in server.js
        const response = await fetchWithLogging('/api/users');
        const users = await response.json();

        console.log(`Fetched ${users.length} users, looking for user with ID: ${userId}`);

        // Debug: log a few user IDs to see what we're working with
        if (users.length > 0) {
            console.log('Sample user IDs:', users.slice(0, 3).map(u => u._id));
            console.log('Sample user with phone:', users[0].phone ? 'Has phone' : 'No phone');
            console.log('First user details:', {
                id: users[0]._id,
                name: `${users[0].firstName} ${users[0].lastName}`,
                hasPhone: !!users[0].phone,
                hasEmail: !!users[0].email,
                phoneType: typeof users[0].phone
            });
        }

        // Find the user by ID, comparing both as strings to handle ObjectId vs string comparison
        const user = users.find(u => u._id === userId || u._id.toString() === userId.toString());

        if (user) {
            console.log(`Found user: ${user.firstName} ${user.lastName}`);
            console.log(`User phone details: ${user.phone ? 'Available' : 'Missing'}, Type: ${typeof user.phone}`);
            console.log(`User data: ${JSON.stringify(user).substring(0, 300)}...`);
            return user;
        }

        console.log('User not found in users list. Trying fallback...');

        // Try to get user data directly (may only work for current user)
        try {
            const userData = await fetchUserData();
            if (userData && (userData._id === userId || userData._id.toString() === userId.toString())) {
                console.log('Found user in current user data');
                console.log(`Current user phone: ${userData.phone ? userData.phone : 'Not available'}`);
                return userData;
            }
        } catch (error) {
            console.log('Fallback to fetchUserData failed:', error);
        }

        return null;
    } catch (error) {
        console.error(`Error fetching user by ID (${userId}):`, error);
        throw error;
    }
}

// Fetch user favorites with property details
export async function fetchUserFavorites() {
    try {
        console.log('Fetching user favorites...');

        // First get the favorites list
        const response = await fetchWithLogging('/api/favorites');
        const favorites = await response.json();

        if (!Array.isArray(favorites) || favorites.length === 0) {
            console.log('No favorites found or empty array returned');
            return [];
        }

        console.log(`Found ${favorites.length} favorites`);

        // Check if favorites are already populated with property details
        if (favorites[0].propertyId && typeof favorites[0].propertyId === 'object') {
            console.log('Favorites already contain populated property details');

            // Map the data to a consistent format with the property data in the main object
            return favorites.map(favorite => ({
                ...favorite.propertyId,
                favoriteId: favorite._id,
                addedAt: favorite.addedAt
            })).filter(item => item && item._id);
        }

        // If not populated, we need to fetch property details separately
        console.log('Favorites not populated, fetching property details separately...');

        // Get all properties to match with favorites
        const propertiesResponse = await fetchWithLogging('/api/properties');
        const properties = await propertiesResponse.json();

        console.log(`Fetched ${properties.length} properties to match with favorites`);

        // Map favorites to full property objects
        const favoritesWithDetails = favorites.map(favorite => {
            const propertyId = favorite.propertyId;
            const matchedProperty = properties.find(p => p._id === propertyId);

            if (matchedProperty) {
                return {
                    ...matchedProperty,
                    favoriteId: favorite._id,
                    addedAt: favorite.addedAt
                };
            }
            return null;
        }).filter(item => item !== null);

        console.log(`Successfully matched ${favoritesWithDetails.length} favorites with properties`);
        return favoritesWithDetails;
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        // Return empty array instead of throwing to handle 404 gracefully
        if (error.message && error.message.includes('404')) {
            console.log('No favorites found (404 response)');
            return [];
        }
        throw error;
    }
} 
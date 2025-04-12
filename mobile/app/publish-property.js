import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/ScreenLayout';
import { publishProperty } from '../utils/apiHelper';

export default function PublishPropertyScreen() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        surface: '',
        rooms: '',
        type: '',
        address: '',
        category: 'sell', // Default value matching your API
        photos: [],
        diagnostics: '',
        equipment: ''
    });

    const [selectedImages, setSelectedImages] = useState([]);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated && !loading) {
            Alert.alert(
                "Authentication Required",
                "You need to be logged in to publish properties.",
                [
                    { text: "Login", onPress: () => router.replace('/') }
                ]
            );
        }
    }, [isAuthenticated, loading]);

    const handleChange = (name, value) => {
        // Prevent negative values for numeric fields
        if ((name === 'price' || name === 'surface' || name === 'rooms') && value < 0) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImagePick = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert("Permission Required", "You need to allow access to your photos to upload images.");
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7, // Lower quality to reduce file size
                allowsEditing: false,
                aspect: [4, 3],
                maxWidth: 1200, // Limit image width
                maxHeight: 1200, // Limit image height
            });

            if (!result.canceled && result.assets) {
                console.log('Selected images:', result.assets.length);

                // Check if any image is too large (>5MB)
                const oversizedImages = result.assets.filter(img => img.fileSize && img.fileSize > 5 * 1024 * 1024);

                if (oversizedImages.length > 0) {
                    Alert.alert(
                        "Large Images Detected",
                        `${oversizedImages.length} images are larger than 5MB. This may cause upload issues. Would you like to continue anyway?`,
                        [
                            {
                                text: "Cancel",
                                style: "cancel"
                            },
                            {
                                text: "Continue Anyway",
                                onPress: () => {
                                    setSelectedImages(result.assets);
                                    setFormData(prev => ({
                                        ...prev,
                                        photos: result.assets
                                    }));
                                }
                            }
                        ]
                    );
                } else {
                    // No oversized images, proceed normally
                    setSelectedImages(result.assets);
                    setFormData(prev => ({
                        ...prev,
                        photos: result.assets
                    }));
                }
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert("Error", "Failed to pick images. Please try again.");
        }
    };

    const validateForm = () => {
        // Validate required fields
        const requiredFields = ['title', 'description', 'price', 'surface', 'rooms', 'type', 'address'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                Alert.alert("Missing Information", `Please fill in the ${field.charAt(0).toUpperCase() + field.slice(1)} field.`);
                return false;
            }
        }

        // Validate images
        if (selectedImages.length === 0) {
            Alert.alert("Missing Images", "Please select at least one image for your property.");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            console.log('Starting property submission...');

            // Create a proper FormData for upload
            const data = new FormData();

            // Add text fields
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('surface', formData.surface);
            data.append('rooms', formData.rooms);
            data.append('type', formData.type);
            data.append('address', formData.address);
            data.append('category', formData.category);

            if (formData.diagnostics) {
                data.append('diagnostics', formData.diagnostics);
            }

            if (formData.equipment) {
                data.append('equipment', formData.equipment);
            }

            // Log form data for debug
            console.log('Form data prepared:', {
                title: formData.title,
                description: formData.description.substring(0, 30) + '...',
                price: formData.price,
                surface: formData.surface,
                rooms: formData.rooms,
                type: formData.type,
                address: formData.address,
                category: formData.category,
            });

            // Add photos - ensure each one is properly formatted
            if (selectedImages && selectedImages.length > 0) {
                console.log(`Processing ${selectedImages.length} images for upload`);

                selectedImages.forEach((image, index) => {
                    // Get image URI, handle iOS path format
                    const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
                    const imageName = image.fileName || `photo_${index}.jpg`;
                    const imageType = image.type || 'image/jpeg';

                    // Log debugging info
                    console.log(`Processing image ${index}:`, {
                        name: imageName,
                        type: imageType,
                        uri: imageUri.substring(0, 30) + '...'
                    });

                    // Create the file object for FormData
                    data.append('photos', {
                        uri: imageUri,
                        type: imageType,
                        name: imageName,
                    });
                });
            } else {
                console.log('No images selected');
            }

            console.log('Submitting property data to API endpoint...');
            // Send the data to the API
            const result = await publishProperty(data);

            console.log('Property published successfully:', result);

            // Clear form after successful submission
            setFormData({
                title: '',
                description: '',
                price: '',
                surface: '',
                rooms: '',
                type: '',
                address: '',
                category: 'sell',
                photos: [],
                diagnostics: '',
                equipment: ''
            });
            setSelectedImages([]);

            Alert.alert(
                "Success!",
                "Property published successfully!",
                [{ text: "OK", onPress: () => router.replace('/(tabs)') }]
            );
        } catch (error) {
            console.error('Error publishing property:', error);

            // Show a more user-friendly error message
            let errorMessage = "Failed to publish property. ";

            if (error.message.includes('500')) {
                errorMessage += "The server encountered an error. Please check your images and try with smaller files.";
            } else if (error.message.includes('401')) {
                errorMessage += "You need to be logged in to publish a property.";
            } else {
                errorMessage += error.message || "Please try again.";
            }

            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated && !loading) {
        return null; // Return null as the useEffect will handle redirection
    }

    return (
        <ScreenLayout
            title="Publish Property"
            subtitle="List your property for sale or rent"
            keyboardAvoiding={true}
            scrollable={true}
            style={styles.scrollContainer}
        >
            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        onChangeText={(text) => handleChange('title', text)}
                        placeholder="Enter property title"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                        placeholder="Describe your property"
                        multiline
                        numberOfLines={5}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price (DH)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.price}
                        onChangeText={(text) => handleChange('price', text)}
                        placeholder="Enter price"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Surface Area (m²)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.surface}
                        onChangeText={(text) => handleChange('surface', text)}
                        placeholder="Enter surface area"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Number of Rooms</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.rooms}
                        onChangeText={(text) => handleChange('rooms', text)}
                        placeholder="Enter number of rooms"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Type</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.type}
                        onChangeText={(text) => handleChange('type', text)}
                        placeholder="e.g. Apartment, House, Villa"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.category}
                            onValueChange={(value) => handleChange('category', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Sell" value="sell" />
                            <Picker.Item label="Rent" value="rent" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        placeholder="Enter complete address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Property Photos</Text>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handleImagePick}
                        >
                            <FontAwesome name="camera" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>
                                {selectedImages.length > 0
                                    ? "Add More Images"
                                    : "Select Images"}
                            </Text>
                        </TouchableOpacity>

                        {/* Image preview section */}
                        {selectedImages.length > 0 && (
                            <View style={styles.previewContainer}>
                                <Text style={styles.previewTitle}>
                                    Selected Images ({selectedImages.length})
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.previewScroll}
                                >
                                    {selectedImages.map((image, index) => (
                                        <View key={index} style={styles.imagePreview}>
                                            <Image
                                                source={{ uri: image.uri }}
                                                style={styles.previewImage}
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => {
                                                    const updatedImages = [...selectedImages];
                                                    updatedImages.splice(index, 1);
                                                    setSelectedImages(updatedImages);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        photos: updatedImages
                                                    }));
                                                }}
                                            >
                                                <FontAwesome name="times" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Diagnostics</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.diagnostics}
                        onChangeText={(text) => handleChange('diagnostics', text)}
                        placeholder="Enter property diagnostics"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Equipment</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.equipment}
                        onChangeText={(text) => handleChange('equipment', text)}
                        placeholder="List available equipment"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Publish Property</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    imagePickerContainer: {
        marginTop: 10,
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#d77710',
        marginTop: 10,
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    previewContainer: {
        marginTop: 15,
    },
    previewTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    previewScroll: {
        maxHeight: 120,
    },
    imagePreview: {
        position: 'relative',
        marginRight: 10,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#d77710',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
}); 
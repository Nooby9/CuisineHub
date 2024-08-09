import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { writeToDB } from '../Firebase/firestoreHelper';
import { storage } from '../Firebase/firebaseSetup'; // Your Firebase storage setup
import PressableButton from '../components/PressableButton';
import ImagePickerComponent from '../components/ImagePickerComponent'; // Import the ImagePickerComponent
import { googlePlacesApiKey } from '@env'; // Import your Google Places API key
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';

// Define collection name
const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

const PostEditorScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState(''); // State to store post title
    const [content, setContent] = useState(''); // State to store post content
    const [images, setImages] = useState([]); // State to store selected images
    const [placeId, setPlaceId] = useState(''); // State to store selected place ID
    const [searchQuery, setSearchQuery] = useState(''); // State to store search query
    const [restaurants, setRestaurants] = useState([]); // State to store search results
    const [showDropdown, setShowDropdown] = useState(false);
    const [author, setAuthor] = useState('');

    // Callback function to handle image selection
    const handleImageSelect = (uris) => {
        setImages(uris);
    };

    // Function to handle search button press
    const handleSearchPress = async () => {
        if (!searchQuery) return; // Exit if search query is empty

        const options = {
            method: 'GET',
            url: `https://maps.googleapis.com/maps/api/place/textsearch/json`,
            params: {
                query: searchQuery,
                type: 'restaurant',
                key: googlePlacesApiKey,
                language: 'en',
            },
        };

        try {
            const response = await axios.request(options);
            setRestaurants(response.data.results);
            setShowDropdown(true); // Show dropdown with search results
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    // Function to handle restaurant selection
    const handleSelectRestaurant = (restaurant) => {
        setPlaceId(restaurant.place_id); // Set selected restaurant's place_id
        setSearchQuery(restaurant.name); // Update search query with selected restaurant's name
        setShowDropdown(false); // Hide dropdown after selection
    };

    // Function to handle post submission
    const handleSubmit = async () => {
        // Check if the title is empty
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a title for your post.');
            return;
        }

        // Check if the content is empty
        if (!content.trim()) {
            Alert.alert('Content Required', 'Please enter content for your post.');
            return;
        }

        // Check if at least one image is selected
        if (images.length === 0) {
            Alert.alert('No Image Selected', 'Please select at least one image before submitting.');
            return;
        }

        // Check if a place is selected
        if (!placeId) {
            Alert.alert('No Restaurant Selected', 'Please select a restaurant from the search results.');
            return;
        }

        // Use "Anonymous" if author is empty
        const authorName = author || 'Anonymous';

        try {
            // Upload images and get their URLs
            const imageUrls = await Promise.all(images.map(imageUri => uploadImageToStorage(imageUri)));
            // Prepare the post data
            const postData = {
                title,
                imageUrls:imageUrls,
                place_id: placeId,
                author: authorName,
                comment: content,
                likes: 0,
                date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
                comments: [],
            };

           
                // Write to Firestore
                await writeToDB(postData, COLLECTION_NAME);
                Alert.alert('Success', 'Post has been successfully submitted.');

                // Navigate back to the previous screen after submission
                navigation.goBack();
            } catch (error) {
                console.error('Error writing to Firestore: ', error);
                Alert.alert('Error', 'An error occurred while submitting your post.');
            }
        };

        async function uploadImageToStorage(imageUri) {
            try {
                // Fetch the image data
                const response = await fetch(imageUri);
                if (!response.ok) {
                    throw new Error("The fetch imgae request was not successful");
                }
                const blob = await response.blob();
                console.log(blob);
                // Create a reference to the Firebase Storage
                const imageName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
                const imageRef = ref(storage, `images/${imageName}`);

                // Upload the blob to Firebase Storage
                const uploadResult = await uploadBytesResumable(imageRef, blob);
                console.log("fullpath:", uploadResult.metadata.fullPath)
                // Store the image URI in Firestore
                return uploadResult.metadata.fullPath;
            } catch (error) {
                console.error("Error uploading image: ", error);
                Alert.alert("Upload Failed", "There was an error uploading the image.");
            }
        }

        return (
            <View style={styles.container}>

                {/* Search for Restaurants */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a restaurant..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <PressableButton onPress={handleSearchPress}>
                        <Ionicons name="search" size={24} color="black" />
                    </PressableButton>
                </View>

                {/* Dropdown for Search Results */}
                {showDropdown && (
                    <FlatList
                        data={restaurants}
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleSelectRestaurant(item)}
                            >
                                <Text style={styles.dropdownText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.dropdown}
                    />
                )}

                {/* Title Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Content Input */}
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Content"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={4}
                />
                {/* Image Picker */}
                <ImagePickerComponent onImageSelect={handleImageSelect} />

                {/* Post Button */}
                <View style={styles.buttonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.postButton,
                            pressed && styles.pressedStyle,
                        ]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.postButtonText}>
                            {route.name === 'New Post' ? 'Post' : 'Confirm Edit'}
                        </Text>
                    </Pressable>
                </View>

            </View>
        );
    };

    // Styles for the screen
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: '#fff',
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            marginBottom: 15,
        },
        textArea: {
            // flex: 1,
            height: 80,
            textAlignVertical: 'top',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        searchInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            marginRight: 5
        },
        dropdown: {
            maxHeight: 200,
            minHeight: 200,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            marginTop: 5,
        },
        dropdownItem: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
        },
        dropdownText: {
            fontSize: 16,
        },
        buttonContainer: {
            alignSelf: 'center', // Center the button horizontally
            marginBottom: 20, // Add margin from the bottom
            width: '100%', // Take the full width
            position: 'absolute',
            bottom: 20,
            paddingHorizontal: 40, // Add padding on both sides
        },
        postButton: {
            height: 40,
            backgroundColor: '#ff3b30',
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 5,
        },
        pressedStyle: {
            opacity: 0.8,
        },
        postButtonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

    export default PostEditorScreen;

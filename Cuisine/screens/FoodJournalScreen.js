import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { query, where, collection, onSnapshot } from 'firebase/firestore';
import * as Location from 'expo-location';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import { database, auth } from '../Firebase/firebaseSetup';
import PostItem from '../components/PostItem';
import { fetchPlaceDetails } from '../utils/CommonMethod';
import { useNavigation } from '@react-navigation/native';


const FoodJournalScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]); // State to store user's posts
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        // Initial region setup for the map
        latitude: 37.4161493,
        longitude: -122.0812166,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    });
    const [currentLocation, setCurrentLocation] = useState(null); // State to store current location
    const currentUserId = auth.currentUser.uid;

    // Define collection name
    const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

    // Fetch user's posts and get user location on component mount
    useEffect(() => {
        (async () => {
            try {
                // Request user location permission
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Location permission not granted');
                    setLoading(false); // Stop loading if permission is denied
                    return;
                }

                // Get current location
                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                });
                // Store current location for marker
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error fetching location:', error);
            } finally {
                setLoading(false); // Stop loading once location is set
            }
        })();
    }, []);

    // Fetch user's posts and get user location on component mount
    useEffect(() => {
        const userPostsQuery = query(
            collection(database, COLLECTION_NAME),
            where('author', '==', currentUserId)
        );

        const unsubscribe = onSnapshot(userPostsQuery, async (querySnapshot) => {
            let postsArray = [];

            if (!querySnapshot.empty) {
                const promises = querySnapshot.docs.map(async (doc) => {
                    const postData = doc.data();

                    // Fetch additional place details
                    let placeDetails = {};
                    if (postData.place_id) {
                        placeDetails = await fetchPlaceDetails(postData.place_id);
                    }

                    return {
                        id: doc.id,
                        ...postData,
                        placeDetails,
                    };
                });


                postsArray = await Promise.all(promises);
            }

            setPosts(postsArray);
        }
        );
        return () => unsubscribe(); // Cleanup subscription on unmount



    }, []);

    // Handle post deletion
    const handleDelete = (postId) => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => deletePost(postId) }, // Call delete function
        ]);
    };

    // Delete post function (assume you have a Firestore delete function)
    const deletePost = async (postId) => {
        try {
            await deletePostFromFirestore(postId); // Replace with actual delete logic
            setPosts(posts.filter((post) => post.id !== postId));
            Alert.alert('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
        }
    };

    // Function to handle navigation to the PostEditorScreen in edit mode
    const handleEditPress = (post) => {
        navigation.navigate('Edit Post', {
            post, // Pass the post data to the editor
            mode: 'edit', // Indicate that we're in edit mode
        });
    };

    return (
        <View style={styles.container}>
            {/* Map View */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                >
                    {currentLocation && (
                        <Marker coordinate={currentLocation} pinColor="blue">
                            <View style={styles.markerContainer}>
                                <Text style={styles.markerText}>Your Location</Text>
                                <Ionicons name="location-sharp" size={24} color="blue" />
                            </View>
                        </Marker>
                    )}

                    {posts.map((post) => (
                        <Marker
                            key={post.place_id}
                            coordinate={{
                                latitude: post.placeDetails.geometry.location.lat,
                                longitude: post.placeDetails.geometry.location.lng,
                            }}
                            title={post.placeDetails.name}
                            description={
                                post.placeDetails ? post.placeDetails.formatted_address : post.comment
                            }
                        />
                    ))}
                </MapView>

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#ff3b30" />
                        <Text style={styles.loadingText}>Loading map...</Text>
                    </View>
                )}

            </View>

            {/* Post List */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => <PostItem item={item} onPress={handleEditPress} />}
                contentContainerStyle={styles.postList}

            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        position: 'relative', // Allows the loading overlay to be positioned absolutely within the map container
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 3.5, // Adjusted for a smaller map height
    },
    map: {
        ...StyleSheet.absoluteFillObject, // Makes the map fill the entire container
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerText: {
        color: 'blue',
        fontSize: 8,
        marginBottom: 2,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#333', // Dark text color for visibility
        fontWeight: 'bold',
    },
    postList: {
        padding: 10,
    },
    postCardContainer: {
        width: '48%',
        marginBottom: 10,
        position: 'relative', // Ensure the edit/delete buttons are positioned correctly
    },
    actionButton: {
        position: 'absolute',
        zIndex: 1, // Ensure it is on top of the PostItem component
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: Background to make it visible
        padding: 5, // Optional: Adjust padding
        borderRadius: 50, // Circular background for better visibility
    },
    editButton: {
        top: 5, // Aligns the edit button to the top of the post
        right: 5, // Aligns the edit button to the right of the post
    },
    deleteButton: {
        bottom: 5, // Aligns the delete button to the bottom of the post
        right: 5, // Aligns the delete button to the right of the post
    },

});

export default FoodJournalScreen;

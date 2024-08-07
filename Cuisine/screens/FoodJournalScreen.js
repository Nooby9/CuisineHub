import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import * as Location from 'expo-location';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import { database } from '../Firebase/firebaseSetup';
import PostItem from '../components/PostItem';
import { fetchPlaceDetails } from '../utils/CommonMethod';



const FoodJournalScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]); // State to store user's posts
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        // Initial region setup for the map
        latitude: 37.4161493,
        longitude: -122.0812166,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
    });
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
                    latitudeDelta: 0.35,
                    longitudeDelta: 0.35,
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
        const unsubscribe = onSnapshot(
            collection(database, COLLECTION_NAME),
            async (querySnapshot) => {
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

    // Render a single post item
    const renderPostItem = ({ item }) => (
        <View style={styles.postCard}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={styles.postActions}>
                <Pressable onPress={() => navigation.navigate('EditPost', { postId: item.id })}>
                    <Text style={styles.editButton}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash" size={24} color="red" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Map View */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                >
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
                renderItem={({ item }) => <PostItem item={item} />}
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
    postCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    editButton: {
        color: '#007BFF',
    },
});

export default FoodJournalScreen;

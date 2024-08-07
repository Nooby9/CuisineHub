import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { getSavedPosts } from '../Firebase/firestoreHelper';
import { database } from '../Firebase/firebaseSetup';
import PostItem from '../components/PostItem';
import { fetchPlaceDetails } from '../utils/CommonMethod';

const userId = 'j3lDxeV4xis2aSngmgyU'; // Your user ID

const SavedPostsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]); // State to store user's posts
  const [region, setRegion] = useState({
    // Initial region setup for the map
    latitude: 37.4161493,
    longitude: -122.0812166,
    latitudeDelta: 0.35,
    longitudeDelta: 0.35,
  });

  useEffect(() => {
    (async () => {
      // Request user location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
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
    })();
  }, []);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const savedPostIds = await getSavedPosts(userId);
      console.log('Saved post IDs:', savedPostIds);
      let postsArray = [];

      const promises = savedPostIds.map(async (postId) => {
        const postDoc = await getDoc(doc(database, 'Post', postId));
        const postData = postDoc.data();

        let placeDetails = {};
        if (postData.place_id) {
          placeDetails = await fetchPlaceDetails(postData.place_id);
        }

        return {
          id: postId,
          ...postData,
          placeDetails,
        };
      });

      postsArray = await Promise.all(promises);
      setPosts(postsArray);
    };

    fetchSavedPosts();
  }, []);


    // to-do remove saved post
  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deletePost(postId) },
    ]);
  };

  const deletePost = async (postId) => {
    try {
      await deletePostFromFirestore(postId); 
      setPosts(posts.filter((post) => post.id !== postId));
      Alert.alert('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {posts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.placeDetails.geometry.location.lat,
              longitude: post.placeDetails.geometry.location.lng,
            }}
            title={post.placeDetails.name}
            description={post.placeDetails ? post.placeDetails.formatted_address : post.comment}
          />
        ))}
      </MapView>

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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 3.5,
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

export default SavedPostsScreen;

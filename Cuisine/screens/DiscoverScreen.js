import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PostItem from '../components/PostItem'; // Ensure correct import path
import { subscribeToCollection } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../style';
import * as Location from 'expo-location';

const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

// Helper function to calculate the distance between two coordinates in kilometers
const haversineDistance = (coords1, coords2) => {
  // Check if either of the coordinates is null or undefined
  if (!coords1 || !coords2 || !coords1.latitude || !coords1.longitude || !coords2.latitude || !coords2.longitude) {
    console.error('Invalid coordinates provided:', coords1, coords2);
    return null; // or return a default value, e.g., 0 or -1, depending on your use case
  }

  const toRad = (x) => (x * Math.PI) / 180;

  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const DiscoverScreen = () => {
  const [posts, setPosts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  function getPostDetailPress(post) {
    navigation.navigate('Post', { post });
  }

  // Fetch the user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (!currentLocation) {
      return; // If the current location is not available, do not proceed.
    }

    const unsubscribe = onSnapshot(
      collection(database, COLLECTION_NAME),
      async (querySnapshot) => {
        let postsArray = [];

        if (!querySnapshot.empty) {
          const promises = querySnapshot.docs.map(async (doc) => {
            const postData = doc.data();
            let distance = 100

            if (postData.location) {
              // Calculate distance from the current location to the post's location
              distance = haversineDistance(currentLocation, {
                latitude: postData.location.latitude,
                longitude: postData.location.longitude,
              });
            }

            // Filter out posts that restaurant is more than 40 km away
            if (distance <= 40) {
              return {
                id: doc.id,
                distance,
                ...postData,
              };
            } else {
              return null;
            }
          });

          postsArray = (await Promise.all(promises)).filter(Boolean);

          postsArray.sort((a, b) => {
            // If dates are equal, sort by like count (most liked first)
            const likesComparison = (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
            if (likesComparison !== 0) return likesComparison;
            // Sort by distance
            const distanceComparison = a.distance - b.distance;
            if (distanceComparison !== 0) return distanceComparison;
            // Sort by date (most recent first)
            const dateComparison = new Date(b.date) - new Date(a.date);
            if (dateComparison !== 0) return dateComparison;
            // If likes are equal, sort by comment count (most comments first)
            return (b.comments?.length || 0) - (a.comments?.length || 0);
          });
        }

        setPosts(postsArray);
        setLoading(false); // Stop loading when posts are fetched
      }
    );
    return () => unsubscribe();
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} onPress={getPostDetailPress} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});

export default DiscoverScreen;
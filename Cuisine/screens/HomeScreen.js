import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PostItem from '../components/PostItem'; // Ensure correct import path
import { subscribeToCollection } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';


// Define collection name
const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);


  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, COLLECTION_NAME),
      async (querySnapshot) => {
        let postsArray = [];

        if (!querySnapshot.empty) {
          const promises = querySnapshot.docs.map(async (doc) => {
            const postData = doc.data();
            let restaurantData = null;

            // Check if the restaurant reference exists and fetch the details
            if (postData.restaurant && postData.restaurant.path) {
              try {
                const restaurantRef = postData.restaurant; // Assuming restaurant is a DocumentReference
                const restaurantDoc = await getDoc(restaurantRef);
                if (restaurantDoc.exists) {
                  restaurantData = restaurantDoc.data();
                }
              } catch (error) {
                console.error('Error fetching restaurant details:', error);
              }
            }

            return {
              id: doc.id,
              ...postData,
              restaurant: restaurantData,
            };
          });

          postsArray = await Promise.all(promises);
        }

        setPosts(postsArray);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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

export default HomeScreen;
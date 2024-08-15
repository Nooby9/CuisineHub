import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PostItem from '../components/PostItem'; // Ensure correct import path
import { subscribeToCollection } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import { useNavigation  } from '@react-navigation/native';
import { colors } from '../style';


// Define collection name
const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

const DiscoverScreen = () => {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  function getPostDetailPress(post){
    navigation.navigate('Post', { post});
  }


  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, COLLECTION_NAME),
      async (querySnapshot) => {
        let postsArray = [];

        if (!querySnapshot.empty) {
          const promises = querySnapshot.docs.map(async (doc) => {
            const postData = doc.data();

            return {
              id: doc.id,
              ...postData
            };
          });

          postsArray = await Promise.all(promises);
          // Sort the posts array based on the given criteria
          postsArray.sort((a, b) => {
            // If dates are equal, sort by like count (most liked first)
            const likesComparison = (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
            if (likesComparison !== 0) return likesComparison;
            // First, sort by date (most recent first)
            const dateComparison = new Date(b.date) - new Date(a.date);
            if (dateComparison !== 0) return dateComparison;
            // If likes are equal, sort by comment count (most comments first)
            return (b.comments?.length || 0) - (a.comments?.length || 0);
          });
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
        renderItem={({ item }) => <PostItem item={item} onPress={getPostDetailPress}/>}
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
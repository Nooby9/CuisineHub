import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { auth } from '../Firebase/firebaseSetup';
import { getFavoritePosts } from '../Firebase/firestoreHelper'; // Assuming this function fetches favorite posts
import PostItem from '../components/PostItem';

const FavoritePostsScreen = ({ navigation }) => {
  const [favoritePosts, setFavoritePosts] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const favorites = await getFavoritePosts(user.uid); // Fetch favorite posts
        console.log('Favorite posts:', favorites);
        setFavoritePosts(favorites);
      }
    };

    fetchFavorites();
  }, []);

  function getPostDetailPress(post){
    navigation.navigate('Post', { post});
  }



  return (
    <View style={styles.container}>
      {favoritePosts.length === 0 ? (
        <Text style={styles.emptyText}>No favorite posts found.</Text>
      ) : (
        <FlatList
            data={favoritePosts}
            renderItem={({ item }) => <PostItem item={item} onPress={getPostDetailPress}/>}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.contentContainer}
        />
      )}
    </View>
  );
};

export default FavoritePostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});

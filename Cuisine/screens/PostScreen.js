// PostScreen.js
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { colors, commonStyles } from '../style';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../Firebase/firebaseSetup';
import { fetchPlaceDetails } from '../utils/CommonMethod';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchArrayDataByField, updateLikeStatus } from '../Firebase/firestoreHelper';


// Define collection name
const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

const PostScreen = ({ route }) => {
    const { post } = route.params;
    const [isRestaurantFavorite, setIsRestaurantFavorite] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const navigation = useNavigation();
    //TODO: use this after supporting authentication
  // const currentUserId = auth.currentUser.uid; 
  const currentUserId = "h3omrHZiE8fkrdl5jTPhTFNaWIP2";

   // useEffect to check if the user has already liked the post
  useEffect(() => {
    async function fetchLikeData() {
        try {
          const likedBy = await fetchArrayDataByField(COLLECTION_NAME, post.id, 'likedBy');
  
          setIsFavorite(likedBy.includes(currentUserId));
          console.log(likedBy.length)
          setLikesCount(likedBy.length);
        } catch (error) {
          console.error('Error checking if post is liked:', error);
        }
      }
  
      fetchLikeData();
    }, []);
  
    // Function to handle the like button press
    const handleLikePress = async () => {
      const newFavoriteState = !isFavorite; // Toggle the favorite state
  
      setIsFavorite(newFavoriteState); // Update the local favorite state
  
      try {
        await updateLikeStatus(COLLECTION_NAME, post.id, 'likedBy', currentUserId, newFavoriteState);
        setLikesCount(newFavoriteState ? likesCount + 1 : likesCount - 1); // Update the local likes count
      } catch (error) {
        console.error('Error updating likes in Firestore:', error);
        // Optionally handle error, e.g., rollback the like count in UI
      }
    };

    // useEffect to fetch restaurant details based on place_id from the post data
    useEffect(() => {
        const fetchData = async () => {
            if (post.place_id) {
                const placeDetails = await fetchPlaceDetails(post.place_id);
                setRestaurant(placeDetails);
            }
        };
        fetchData();
    }, [post.place_id]);

    // useEffect to fetch image URLs from Firebase Storage
    useEffect(() => {
        async function fetchImageUrls() {
            try {
                const urls = await Promise.all(
                    post.imageUrls.map(async (imageUri) => {
                        const imageRef = ref(storage, imageUri);
                        const url = await getDownloadURL(imageRef);
                        return url;
                    })
                );
                setImageUrls(urls);
            } catch (error) {
                console.error('Error fetching image URLs: ', error);
            }
        }
        fetchImageUrls();
    }, [post.imageUrls]);

    const handlePress = () => {
        setIsRestaurantFavorite(!isRestaurantFavorite);
    };

    // Function to render each image in the FlatList
    const renderImage = ({ item }) => (
        <Image source={{ uri: item }} style={styles.postImage} />
    );

    const navigateToRestaurant = (place_id) => {
        if (place_id) {
            navigation.navigate('Restaurant', { place_id });
        }
    };

    if (!restaurant) {
        return <Text>Loading restaurant information...</Text>;
    }

    return (
        <View style={styles.container}>
        <ScrollView style={styles.container}>
            <FlatList
                data={imageUrls}
                renderItem={renderImage}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />

            <View style={styles.restaurantSection}>
                <Pressable style={styles.restaurantInfo} onPress={() => navigateToRestaurant(post.place_id)}>
                    <View style={styles.restaurantDetail}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <MaterialIcons
                            name="chevron-right" // Add an arrow to indicate navigation
                            size={22}
                            color="#777"
                            style={styles.chevron}
                        />

                    </View>

                    <View style={commonStyles.likeSection}>
                        <PressableButton onPress={handlePress} >
                            <MaterialIcons
                                name={isRestaurantFavorite ? 'favorite' : 'favorite-border'}
                                size={22}
                                color={isRestaurantFavorite ? colors.favorite : colors.notFavorite}
                            />
                        </PressableButton>
                    </View>
                </Pressable>

                <Text style={styles.restaurantRating}>{restaurant.rating} stars</Text>
                <Text style={styles.restaurantAddress}>{restaurant.formatted_address}</Text>
            </View>

            <View style={styles.commentSection}>
            
                <Text style={styles.comment}>{post.comment}</Text>
            </View>

            <Text style={styles.date}>Posted on {post.date}</Text>
            <View style={styles.divider} />

            <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>{post.comments.length} Comments</Text>
                {post.comments.map((comment, index) => (
                    <View key={index} style={styles.commentContainer}>
                        <View style={styles.commentItem}>
                            <Text style={styles.commentAuthor}>{comment.author}</Text>
                            <Text>{comment.text}</Text>
                        </View>
                        {index < post.comments.length - 1 && (
                            <View style={styles.divider} />
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
        <Pressable style={styles.fab} onPress={handleLikePress}>
        <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? colors.favorite : colors.notFavorite}
        />
    </Pressable>
</View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    postImage: {
        width: 300,
        height: 200,
        margin: 10,
        borderRadius: 10,
    },
    commentSection: {
        padding: 15,
    },
    comment: {
        fontSize: 14,
        color: '#333',
    },
    restaurantSection: {
        padding: 15,
        borderColor: 'white',
        borderWidth: 8,
        borderRadius: 15,
        backgroundColor: 'lemonchiffon',
    },
    restaurantInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    restaurantDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    restaurantRating: {
        fontSize: 14,
        color: '#777',
    },
    restaurantAddress: {
        fontSize: 14,
        color: '#777',
    },
    date: {
        fontSize: 14,
        color: '#777',
        alignItems: 'center',
        marginHorizontal:15
    },
    location: {
        fontSize: 14,
        color: '#777',
    },
    commentsSection: {
        padding: 15,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    commentContainer: {
        marginBottom: 15,
    },
    commentItem: {
        padding: 10,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
        marginVertical: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'paleturquoise',
        borderRadius: 50,
        padding: 15,
        elevation: 5,
    },
});

export default PostScreen;
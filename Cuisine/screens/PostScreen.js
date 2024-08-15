// PostScreen.js
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, FlatList, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { colors, commonStyles } from '../style';
import { getUserName, updateDB } from '../Firebase/firestoreHelper';
import { auth, storage } from '../Firebase/firebaseSetup'; // Import Firebase storage setup
import { fetchImageUrls, fetchPlaceDetails } from '../utils/CommonMethod';
import { FIREBASE_COLLECTIONS } from '../FirebaseCollection';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchArrayDataByField, updateLikeStatus } from '../Firebase/firestoreHelper';
import { arrayUnion } from 'firebase/firestore';
import { KeyboardAvoidingView, Platform } from 'react-native';


// Define collection name
const COLLECTION_NAME = FIREBASE_COLLECTIONS.POSTS;

const PostScreen = ({ route }) => {
    const { post } = route.params;
    const [isRestaurantFavorite, setIsRestaurantFavorite] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [newComment, setNewComment] = useState(''); // State for new comment text
    const [commentsWithUsernames, setCommentsWithUsernames] = useState([]); // State to store comments with usernames


    const navigation = useNavigation();
    const currentUserId = auth.currentUser.uid;

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
        const fetchImages = async () => {
            try {
                const urls = await fetchImageUrls(post.imageUrls);
                setImageUrls(urls);
            } catch (error) {
                console.error('Error fetching image for post detail:', error);
            }
        };

        fetchImages();
    }, [post.imageUrls]);

    // Fetch usernames for comments and update the state
    useEffect(() => {
        const fetchUsernamesForComments = async () => {
            const commentsWithNames = await Promise.all(post.comments.map(async (comment) => {
                const username = await getUserName(comment.author);
                return {
                    ...comment,
                    authorName: username || 'Anonymous',
                };
            }));
            setCommentsWithUsernames(commentsWithNames);
        };
        fetchUsernamesForComments();
    }, [post.comments]);


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

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Comment Required', 'Please enter a comment before submitting.');
            return;
        }
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const commentData = {
            author: currentUserId, // Use the current user's ID or name
            text: newComment.trim(),
            date: formatDate(new Date()), // Current date in YYYY-MM-DD format
        };

        try {
            // Update the Firestore post document with the new comment
            await updateDB(post.id, {
                comments: arrayUnion(commentData)
            }, COLLECTION_NAME);

            // Update the local state to show the new comment immediately
            post.comments.push(commentData);
            setNewComment(''); // Clear the comment input

            const updatedCommentsWithNames = await fetchUsernamesForComments(post.comments);
            setCommentsWithUsernames(updatedCommentsWithNames);
            Alert.alert('Success', 'Comment has been successfully added.');
        } catch (error) {
            console.error('Error adding comment: ', error);
            Alert.alert('Error', 'There was an error adding your comment.');
        }
    };
    // Helper function to fetch usernames for comments
    const fetchUsernamesForComments = async (comments) => {
        return await Promise.all(comments.map(async (comment) => {
            const username = await getUserName(comment.author);
            return {
                ...comment,
                authorName: username || 'Anonymous',
            };
        }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80} // Adjust this value based on your header height or needs
        >
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

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{post.title}</Text>
                </View>

                <View style={styles.commentSection}>

                    <Text style={styles.comment}>{post.comment}</Text>
                </View>

                <Text style={styles.date}>Posted on {post.date}</Text>
                <View style={styles.divider} />

                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>{post.comments.length} Comments</Text>
                    <View style={styles.addCommentSection}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <Pressable style={styles.addCommentButton} onPress={handleAddComment}>
                            <Text style={styles.addCommentButtonText}>Submit</Text>
                        </Pressable>
                    </View>

                    {commentsWithUsernames
                        .slice() // Create a shallow copy to avoid mutating the original array
                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort comments by date (newest first)
                        .map((comment, index) => (
                            <View key={index} style={styles.commentContainer}>
                                <View style={styles.commentItem}>
                                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                                    <Text style={styles.commentDate}>{comment.date}</Text>
                                    <Text>{comment.text}</Text>
                                </View>
                                {index < post.comments.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </View>
                        ))}
                </View>
            </ScrollView>
            <View style={commonStyles.likeSection}>
                <Pressable style={styles.fab} onPress={handleLikePress}>
                    <View style={styles.iconContainer}>
                        <Icon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={26}
                            color={isFavorite ? colors.favorite : colors.notFavorite}
                        />
                        <Text style={styles.likesCount}>{likesCount}</Text>
                    </View>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        fontSize: 16,
        color: colors.textDark,
    },
    restaurantSection: {
        padding: 15,
        borderColor: colors.white,
        borderWidth: 8,
        borderRadius: 15,
        backgroundColor: colors.restaurantSecBg,
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
        color: colors.textDark,
    },
    restaurantRating: {
        fontSize: 14,
        color: colors.textLight,
    },
    restaurantAddress: {
        fontSize: 14,
        color: colors.textLight,
    },
    date: {
        fontSize: 13,
        color: colors.textLight,
        alignItems: 'center',
        marginHorizontal: 15
    },
    location: {
        fontSize: 14,
        color: colors.textLight,
    },
    titleSection: {
        padding: 10,
        backgroundColor: colors.background,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        textAlign: 'center',
        textAlign: 'left',
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
    commentDate: {
        fontSize: 12,
        color: colors.commentText,
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
        backgroundColor: colors.likeBg,
        borderRadius: 50,
        width: 60, // Adjust the width to ensure it remains circular
        height: 60, // Ensure the height is the same as the width for circular shape
        elevation: 5,
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
    },
    iconContainer: {
        alignItems: 'center', // Center the icon and text vertically
        justifyContent: 'center',
    },
    likesCount: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2, // Small margin between the icon and the text
    },

    addCommentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        padding: 10,
        marginRight: 10,
        backgroundColor: colors.background,
    },
    addCommentButton: {
        backgroundColor: colors.addCommentButton,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    addCommentButtonText: {
        color: colors.background,
        fontWeight: 'bold',
    },

});

export default PostScreen;
// PostScreen.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { colors, commonStyles } from '../style';

const PostScreen = ({ route }) => {
    const { post } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const toggleLike = () => {
        setLiked(!liked);
    };

    const handlePress = () => {
        setIsFavorite(!isFavorite);
    };

    const renderImage = ({ item }) => (
        <Image source={{ uri: item }} style={styles.postImage} />
    );

    return (
        <ScrollView style={styles.container}>
            <FlatList
                data={post.images}
                renderItem={renderImage}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />

            <View style={styles.restaurantSection}>
                {/* TODO */}
                <Pressable style={styles.restaurantInfo} onPress={() => console.log('Navigate to restaurant')}>
                    <View style={styles.restaurantDetail}>
                    <Text style={styles.restaurantName}>{post.restaurant.name}</Text>
                    <Text style={styles.restaurantRating}>· {post.restaurant.rating}</Text>
                    </View>
                    
                    <View style={commonStyles.likeSection}>
                        <PressableButton onPress={handlePress} >
                            <MaterialIcons
                                // Toggle between filled and outlined icon
                                name={isFavorite ? 'favorite' : 'favorite-border'}
                                size={22}
                                // Change color based on state
                                color={isFavorite ? colors.favorite : colors.notFavorite}
                            />
                        </PressableButton>
                        <Text style={commonStyles.cardLikes}>{post.likes}</Text>
                    </View>
                </Pressable>
                <Text style={styles.restaurantType}>{post.restaurant.type}</Text>
            </View>

            <View style={styles.commentSection}>
                <Text style={styles.comment}>{post.comment}</Text>
            </View>

            <View style={styles.dateLocationSection}>
                <Text style={styles.date}>Posted on {post.date}</Text>
                <Text style={styles.location}>{post.location}</Text>
                
            </View>
            <View style={styles.divider} />

            <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>{post.comments.length} Comments</Text>
                {post.comments.map((comment, index) => (
                    <View key={index} style={styles.commentContainer}>
                        <View style={styles.commentItem}>
                            <Text style={styles.commentAuthor}>{comment.author}</Text>
                            <Text>{comment.text}</Text>
                        </View>
                        {/* Add a divider line between comments, except after the last comment */}
                        {index < post.comments.length - 1 && (
                            <View style={styles.divider} />
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
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
        // backgroundColor: '#f9f9f9',
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    comment: {
        fontSize: 14,
        color: '#333',
    },
    restaurantSection: {
        padding: 15,
    borderColor: 'white',
    borderWidth:8,
    borderRadius: 15,
    backgroundColor: 'lemonchiffon',
    },
    restaurantInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    restaurantDetail:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom:5
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    restaurantRating: {
        marginHorizontal:5,
        fontSize: 16,
        color: '#777',
    },
    restaurantType:{
        fontSize: 15,
        color: '#777',
    },
    restaurantReviews: {
        fontSize: 12,
        color: '#777',
    },
    dateLocationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    date: {
        fontSize: 14,
        color: '#777',
        marginRight: 10
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
    //   commentContainer: {
    //     marginBottom: 15,
    //   },
      commentItem: {
        padding: 10,
        // borderColor: '#eee',
        // borderWidth: 1,
        // borderRadius: 8,
        // backgroundColor: '#f9f9f9',
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
});

export default PostScreen;

// PostScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { colors, commonStyles } from '../style';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';

// Function to fetch place details from Google Places API
const fetchPlaceDetails = async (place_id) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: place_id,
                key: googlePlacesApiKey,
                fields: 'name,rating,formatted_address,photos,types',
            },
        });
        return response.data.result;
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
};

const PostScreen = ({ route }) => {
    const { post } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            if (post.place_id) {
                const placeDetails = await fetchPlaceDetails(post.place_id);
                setRestaurant(placeDetails);
            }
        };
        fetchData();
    }, [post.place_id]);

    const handlePress = () => {
        setIsFavorite(!isFavorite);
    };

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
                                name={isFavorite ? 'favorite' : 'favorite-border'}
                                size={22}
                                color={isFavorite ? colors.favorite : colors.notFavorite}
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
    dateLocationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    date: {
        fontSize: 14,
        color: '#777',
        marginRight: 10,
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
});

export default PostScreen;
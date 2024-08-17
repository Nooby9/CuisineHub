import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Pressable } from 'react-native';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../Firebase/firebaseSetup';
import { writeWithIdToDB, deleteWithIdFromDB, checkIfDocExists } from '../Firebase/firestoreHelper';

const fetchPlaceDetails = async (place_id) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: place_id,
        key: googlePlacesApiKey,
        fields: 'name,rating,opening_hours,formatted_address,photos,geometry,reviews',
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

const getPhotoUrl = (photoReference, maxWidth = 400) => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${googlePlacesApiKey}`;
};

const RestaurantScreen = ({ route }) => {
  const navigation = useNavigation();
  const place_id = route.params.place_id;
  const [restaurant, setRestaurant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const placeDetails = await fetchPlaceDetails(place_id);
      if (placeDetails) {
        setRestaurant(placeDetails);
        if (placeDetails.photos) {
          const photoUrls = placeDetails.photos.map(photo =>
            getPhotoUrl(photo.photo_reference)
          );
          setPhotos(photoUrls);
        }
        if (placeDetails.reviews) {
          setReviews(placeDetails.reviews);
        }

        const user = auth.currentUser;
        if (user) {
          const exists = await checkIfDocExists(`User/${user.uid}/FavoriteRestaurant`, place_id);
          setIsFavorite(exists);
        }
      }
    };
    fetchData();
  }, [place_id]);

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    const user = auth.currentUser;

    if (user && restaurant) {
      const favoriteData = {
        place_id: place_id,
        name: restaurant.name,
        address: restaurant.formatted_address,
        rating: restaurant.rating,
        timestamp: new Date(),
        photo_reference: restaurant.photos[0].photo_reference,
        location: restaurant.geometry.location
      };

      if (!isFavorite) {
        await writeWithIdToDB(favoriteData, `User/${user.uid}/FavoriteRestaurant`, place_id);
      } else {
        await deleteWithIdFromDB(`User/${user.uid}/FavoriteRestaurant`, place_id);
      }
    } else {
      console.error('User not logged in or restaurant data unavailable');
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable 
          onPress={toggleFavorite} 
          style={styles.favoriteButton}
          disabled={!restaurant}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? 'red' : 'black'} 
          />
        </Pressable>
      ),
    });
  }, [navigation, isFavorite, restaurant]);

  const renderImage = ({ item }) => (
    <Image source={{ uri: item }} style={styles.postImage} />
  );

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Image source={{ uri: item.profile_photo_url }} style={styles.reviewProfilePhoto} />
      <View style={styles.reviewContent}>
        <Text style={styles.reviewAuthor}>{item.author_name}</Text>
        <Text style={styles.reviewRating}>Rating: {item.rating}</Text>
        <Text style={styles.reviewText}>{item.text}</Text>
        <Text style={styles.reviewTime}>{item.relative_time_description}</Text>
      </View>
    </View>
  );

  const renderContent = () => (
    <>
      {/* Photos */}
      <FlatList
        data={photos}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      
      {/* Restaurant Details */}
      <View style={styles.restaurantSection}>
        <View style={styles.restaurantDetail}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantRating}>Rating: {restaurant.rating}</Text>
        </View>
        <Text style={styles.restaurantType}>Hours: {restaurant.opening_hours?.open_now ? 'Open!' : 'Closed'}</Text>
      </View>
      
      {/* Location */}
      <View style={styles.locationSection}>
        <View style={styles.locationLeft}>
          <Text style={styles.locationTitle}>Location: </Text>
          <Text style={styles.location}>{restaurant.formatted_address || 'No address available'}</Text>
        </View>
      </View>

      {/* Reviews */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item, index) => index.toString()}
        style={styles.reviewList}
      />
    </>
  );

  if (!restaurant) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      data={[{ key: 'content' }]} // Single item for rendering the entire content
      renderItem={renderContent}
      keyExtractor={(item) => item.key}
    />
  );
};

export default RestaurantScreen;

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
  restaurantSection: {
    padding: 15,
    borderColor: 'white',
    borderWidth: 8,
    borderRadius: 15,
    backgroundColor: 'lemonchiffon',
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
    marginHorizontal: 5,
    fontSize: 16,
    color: '#777',
  },
  restaurantType: {
    fontSize: 15,
    color: '#777',
  },
  locationSection: {
    padding: 15,
    borderColor: 'white',
    borderWidth: 8,
    borderRadius: 15,
    backgroundColor: 'lemonchiffon',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 14,
    paddingTop: 5,
  },
  favoriteButton: {
    marginRight: 15,
  },
  reviewList: {
    padding: 15,
  },
  reviewContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
  },
  reviewProfilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  reviewContent: {
    flex: 1,
  },
  reviewAuthor: {
    fontWeight: 'bold',
  },
  reviewRating: {
    color: '#777',
  },
  reviewText: {
    marginVertical: 5,
  },
  reviewTime: {
    fontSize: 12,
    color: '#999',
  },
});

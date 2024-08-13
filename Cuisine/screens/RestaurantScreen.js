import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Image, Pressable } from 'react-native';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../Firebase/firebaseSetup';
import { writeWithIdToDB, deleteWithIdFromDB, checkIfDocExists } from '../Firebase/firestoreHelper'; // Import the helper functions

const fetchPlaceDetails = async (place_id) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: place_id,
        key: googlePlacesApiKey,
        fields: 'name,rating,opening_hours,formatted_address,photos',
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

        // Check if the restaurant is already a favorite
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
      };

      if (!isFavorite) {
        // Adding to favorites
        await writeWithIdToDB(favoriteData, `User/${user.uid}/FavoriteRestaurant`, place_id);
      } else {
        // Removing from favorites
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
          disabled={!restaurant} // Disable button if restaurant data is not yet available
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

  if (!restaurant) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderImage}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      <View style={styles.restaurantSection}>
        <View style={styles.restaurantDetail}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantRating}>Rating: {restaurant.rating}</Text>
        </View>
        <Text style={styles.restaurantType}>Hours: {restaurant.opening_hours?.open_now ? 'Open!' : 'Closed'}</Text>
      </View>
      <View style={styles.locationSection}>
        <View style={styles.locationLeft}>
          <Text style={styles.locationTitle}>Location: </Text>
          <Text style={styles.location}>{restaurant.formatted_address || 'No address available'}</Text>
        </View>
      </View>
    </ScrollView>
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
});

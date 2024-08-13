import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteRestaurants } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { googlePlacesApiKey } from '@env';

const FavoriteScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const favorites = await getFavoriteRestaurants(user.uid);
        setFavoriteRestaurants(favorites);
      }
    };

    fetchFavorites();
  }, []);

  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googlePlacesApiKey}`;
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Restaurant', { place_id: restaurant.place_id });
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity onPress={() => handleRestaurantPress(item)} style={styles.restaurantContainer}>
      {console.log(item)}
      {item.photo_reference && (
        <Image
          source={{ uri: getPhotoUrl(item.photo_reference) }}
          style={styles.restaurantPhoto}
        />
      )}
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantAddress}>{item.address}</Text>
      <Text>Rating: {item.rating} stars</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {favoriteRestaurants.length === 0 ? (
        <Text style={styles.emptyText}>No favorite restaurants found.</Text>
      ) : (
        <FlatList
          data={favoriteRestaurants}
          keyExtractor={(item) => item.place_id}
          renderItem={renderRestaurant}
        />
      )}
    </View>
  );
};

export default FavoriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  restaurantContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
  },
  restaurantPhoto: {
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
});

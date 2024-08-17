import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteRestaurants } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { googlePlacesApiKey } from '@env';
import * as Location from 'expo-location'; // Importing Location to get current user location

const FavoriteRestaurantScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [sortedRestaurants, setSortedRestaurants] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sortBy, setSortBy] = useState('time'); // 'time' or 'distance'

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const favorites = await getFavoriteRestaurants(user.uid);
        setFavoriteRestaurants(favorites);
        setSortedRestaurants(favorites);
      }
    };

    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    };

    fetchFavorites();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    sortRestaurants(sortBy);
  }, [sortBy, favoriteRestaurants, currentLocation]);

  const sortRestaurants = (method) => {
    if (method === 'time') {
      const sortedByTime = [...favoriteRestaurants].sort((a, b) => b.timestamp - a.timestamp);
      setSortedRestaurants(sortedByTime);
    } else if (method === 'distance' && currentLocation) {
      const sortedByDistance = [...favoriteRestaurants].sort((a, b) => {
        const distanceA = calculateDistance(currentLocation.latitude, currentLocation.longitude, a.lat, a.lng);
        const distanceB = calculateDistance(currentLocation.latitude, currentLocation.longitude, b.lat, b.lng);
        return distanceA - distanceB;
      });
      setSortedRestaurants(sortedByDistance);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googlePlacesApiKey}`;
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Restaurant', { place_id: restaurant.place_id });
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity onPress={() => handleRestaurantPress(item)} style={styles.restaurantContainer}>
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, sortBy === 'time' && styles.activeButton]}
          onPress={() => setSortBy('time')}
        >
          <Text style={styles.buttonText}>Sort by Time Added</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, sortBy === 'distance' && styles.activeButton]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={styles.buttonText}>Sort by Distance</Text>
        </TouchableOpacity>
      </View>

      {sortedRestaurants.length === 0 ? (
        <Text style={styles.emptyText}>No favorite restaurants found.</Text>
      ) : (
        <FlatList
          data={sortedRestaurants}
          keyExtractor={(item) => item.place_id}
          renderItem={renderRestaurant}
        />
      )}
    </View>
  );
};

export default FavoriteRestaurantScreen;

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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

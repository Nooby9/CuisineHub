import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';
import PressableButton from '../components/PressableButton';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true); // Add locationLoading state
  const [region, setRegion] = useState({
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      setLocationLoading(true); // Start loading when requesting location

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access current location was denied. Please enable location services in your settings.');
        setLocationLoading(false); // Stop loading even if permission is denied
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setLocationLoading(false); // Stop loading when location is retrieved
    })();
  }, []);

  const handleSearchPress = async () => {
    setLoading(true);
    const options = {
      method: 'GET',
      url: `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      params: {
        query: searchQuery,
        includedType: 'restaurant',
        key: googlePlacesApiKey,
        language: 'en',
      },
    };

    try {
      const response = await axios.request(options);
      //console.log('Response:', response.data.results);
      setRestaurants(response.data.results);
      updateMapRegion(response.data.results);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMapRegion = (places) => {
    if (places.length === 0) return;

    const firstPlace = places[0];
    setRegion({
      latitude: firstPlace.geometry.location.lat,
      longitude: firstPlace.geometry.location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googlePlacesApiKey}`;
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('Restaurant', { place_id: restaurant.place_id });
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity onPress={() => handleRestaurantPress(item)} style={styles.restaurantContainer}>
      {item.photos && item.photos.length > 0 && (
        <Image
          source={{ uri: getPhotoUrl(item.photos[0].photo_reference) }}
          style={styles.restaurantPhoto}
        />
      )}
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantAddress}>{item.formatted_address}</Text>
      <Text>Rating: {item.rating} stars</Text>
      <Text>Number of Ratings: {item.user_ratings_total}</Text>
    </TouchableOpacity>
  );

  // Display loading until location is fetched
  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Fetching location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <PressableButton onPress={handleSearchPress}>
          <Ionicons name="search" size={24} color="black" />
        </PressableButton>
      </View>
      <MapView style={styles.map} region={region}>
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.place_id}
            coordinate={{
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            }}
            title={restaurant.name}
            description={restaurant.formatted_address}
          />
        ))}
      </MapView>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={renderRestaurant}
          ListEmptyComponent={<Text>Please Search the Restaurant in the Search Bar</Text>}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingLeft: 0
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

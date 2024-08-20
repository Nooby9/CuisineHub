import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
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
  const [locationLoading, setLocationLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [itemHeights, setItemHeights] = useState({});
  const flatListRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access current location was denied. Please enable location services in your settings.');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setLocationLoading(false);
    })();
  }, []);

  const getItemLayout = (data, index) => {
    const height = itemHeights[index] || 0; // Default to 0 if height is not measured yet
    return {
      length: height,
      offset: Object.values(itemHeights).slice(0, index).reduce((sum, h) => sum + h, 0),
      index,
    };
  };

  useEffect(() => {
    if (selectedRestaurant && restaurants.length > 0 && flatListRef.current) {
      const index = restaurants.findIndex(
        (restaurant) => restaurant.place_id === selectedRestaurant.place_id
      );
      if (index !== -1) {
        flatListRef.current.scrollToIndex({ index });
      }
    }
  }, [selectedRestaurant, restaurants]);

  const handleSearchPress = async () => {
    Keyboard.dismiss(); // Hide the keyboard
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

    setRegion({
      latitude: (places[0].geometry.location.lat + region.latitude) / 2,
      longitude: (places[0].geometry.location.lng + region.longitude) / 2,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googlePlacesApiKey}`;
  };

  const handleRestaurantPress = (restaurant) => {
    setSelectedRestaurant(restaurant);
    navigation.navigate('Restaurant', { place_id: restaurant.place_id });
  };

  const handleLayout = (index, event) => {
    const { height } = event.nativeEvent.layout;
    setItemHeights((prevHeights) => ({ ...prevHeights, [index]: height }));
  };

  const renderRestaurant = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleRestaurantPress(item)}
      style={styles.restaurantContainer}
      onLayout={(event) => handleLayout(index, event)}
    >
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
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="My Location"
          description="This is your current location"
          pinColor="blue"
        />
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.place_id}
            coordinate={{
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            }}
            title={restaurant.name}
            description={restaurant.formatted_address}
            onPress={() => setSelectedRestaurant(restaurant)}
          />
        ))}
      </MapView>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={restaurants}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={renderRestaurant}
          ListEmptyComponent={<Text>Please Search the Restaurant in the Search Bar</Text>}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            console.warn('Failed to scroll to index:', info);
          }}
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
    paddingLeft: 0,
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

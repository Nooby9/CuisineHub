import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, Image } from 'react-native';
import PressableButton from '../components/PressableButton';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { googlePlacesApiKey } from '@env';

const SearchScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

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
      console.log('Response:', response.data.results);
      setRestaurants(response.data.results);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googlePlacesApiKey}`;
  };

  const renderRestaurant = ({ item }) => (
    <View style={styles.restaurantContainer}>
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantAddress}>{item.formatted_address}</Text>
      <Text>Rating: {item.rating} stars</Text>
      <Text>Number of Ratings: {item.user_ratings_total}</Text>
      {item.photos && item.photos.length > 0 && (
        <Image
          source={{ uri: getPhotoUrl(item.photos[0].photo_reference) }}
          style={styles.restaurantPhoto}
        />
      )}
    </View>
  );

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
      {/* Temporary button to navigate to RestaurantScreen */}
      <PressableButton onPress={() => navigation.navigate('Restaurant')}>
        <Text>Go to Restaurant</Text>
      </PressableButton>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={renderRestaurant}
          ListEmptyComponent={<Text>No restaurants found</Text>}
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
});

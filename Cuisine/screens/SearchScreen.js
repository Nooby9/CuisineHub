import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import PressableButton from '../components/PressableButton';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { tripAdvisorApiKey } from '@env';

const SearchScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchPress = async () => {
    setLoading(true);
    const options = {
      method: 'GET',
      url: 'https://api.content.tripadvisor.com/api/v1/location/search',
      params: {
        key: tripAdvisorApiKey,  
        searchQuery: searchQuery,
        category: 'restaurants',
        language: 'en',
      },
      headers: { accept: 'application/json' },
    };

    try {
      const response = await axios.request(options);
      setRestaurants(response.data.data); 
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurant = ({ item }) => (
    <View style={styles.restaurantContainer}>
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantAddress}>{item.address}</Text>
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
          keyExtractor={(item) => item.location_id.toString()}
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
});

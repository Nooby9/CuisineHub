import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Button, Alert, Pressable, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getFavoriteRestaurants } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { googlePlacesApiKey } from '@env';
import { verifyPermission } from '../components/NotificationManager';
import PressableButton from '../components/PressableButton';

const FavoriteRestaurantScreen = ({ navigation }) => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [sortedRestaurants, setSortedRestaurants] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [date, setDate] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false); 
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date()); // Temporary selected date before confirmation
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [combinedDateTime, setCombinedDateTime] = useState(null);


  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const favorites = await getFavoriteRestaurants(user.uid);
            setFavoriteRestaurants(favorites);
            setSortedRestaurants(favorites);
          } catch (error) {
            console.error('Error fetching favorite restaurants:', error);
          }
        }
      };

      const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          setCurrentLocation(location.coords);
        } catch (error) {
          console.error('Error getting location:', error);
        }
      };

      fetchFavorites();
      getCurrentLocation();
    }, [])
  );

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

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        setTempSelectedDate(selectedDate); // Temporarily store the selected date if it's valid
      } else {
        Alert.alert('Invalid Date', 'Please select a future date and time.');
      }
    }
  };

  const onAndroidDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      console.log('Selected Date:', selectedDate);
      setShowDateTimePicker(false); // Hide the picker after selecting a date
      setTempSelectedDate(selectedDate); // Temporarily store the selected date
      setShowTimePicker(true);
    }
  };
  

  const onAndroidTimeChange = (event, selectedTime) => {
    if (event.type === 'set') {
      setShowTimePicker(false); // Hide the picker after selecting a time
      const currentDate = new Date();
      console.log('Temp Selected Date:', tempSelectedDate);
      if (tempSelectedDate) {
        const combined = new Date(tempSelectedDate);
        combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        if (combined > currentDate) {
          setCombinedDateTime(combined); // Update the combined date and time
          confirmDateAndroid(combined); // Confirm the date and time
          console.log('Combined Date:', combined);
        } else {
          Alert.alert('Invalid Time', 'Please select a future time.');
        }
      }
    }
  };
  

  const confirmDate = async () => {
    const currentDate = new Date();
    if (tempSelectedDate <= currentDate) {
      Alert.alert('Invalid Date', 'Please select a future date and time.');
      return;
    }

    const hasPermission = await verifyPermission();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Restaurant Reminder",
        body: `Don't forget to visit ${selectedRestaurant.name}!`,
        data: { restaurantId: selectedRestaurant.place_id }
      },
      trigger: {
        date: tempSelectedDate, // Use the temporary date
      },
    });

    setShowDateTimePicker(false); // Hide the picker only after confirmation
    Alert.alert('Reminder Set', `You will be reminded to visit ${selectedRestaurant.name} on ${tempSelectedDate}`);
  };

  const confirmDateAndroid = async (date) => {
    const currentDate = new Date();
    if (!date || date <= currentDate) {
      Alert.alert('Invalid Date', 'Please select a future date and time.');
      return;
    }

    const hasPermission = await verifyPermission();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Restaurant Reminder",
        body: `Don't forget to visit ${selectedRestaurant.name}!`,
        data: { restaurantId: selectedRestaurant.place_id }
      },
      trigger: {
        date: date, // Use the combined date and time
      },
    });

    setShowDateTimePicker(false); // Hide the picker after confirmation
    Alert.alert('Reminder Set', `You will be reminded to visit ${selectedRestaurant.name} on ${date}`);
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
      <Pressable style={styles.reminderButton}
        onPress={() => {
          setSelectedRestaurant(item);
          setShowDateTimePicker(true); 
          setTempSelectedDate(new Date());
        }}
      >
        <Text style={styles.reminderButtonText}>Set Reminder</Text>
      </Pressable>
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

      {/* Conditional rendering for DateTimePicker */}
      {Platform.OS === 'ios' && showDateTimePicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.modalTitle}>Select Reminder Time</Text>
            <DateTimePicker
              value={tempSelectedDate}
              mode="datetime"
              onChange={onDateChange}
            />
            <Button title="Confirm" onPress={confirmDate} />
            <Button title="Close" onPress={() => setShowDateTimePicker(false)} />
            
          </View>
        </View>
      )}


      {Platform.OS === 'android' && showTimePicker && ( 
        <DateTimePicker
          value={tempSelectedDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onAndroidTimeChange}
          
        />
      )}
      {Platform.OS === 'android' && showDateTimePicker && (
        <DateTimePicker
          value={tempSelectedDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onAndroidDateChange}
        />
      )}

      

      

      



    </View>
  );
};

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
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  reminderButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FavoriteRestaurantScreen;

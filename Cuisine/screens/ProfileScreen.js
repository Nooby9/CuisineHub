import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();

  // Navigation handlers for each button
  const handleNewPost = () => {
    navigation.navigate('New Post');
  };

  const handleFoodJournal = () => {
    navigation.navigate('Food Journal');
  };

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <TouchableOpacity style={styles.actionButton} onPress={handleNewPost}>
        <Text style={styles.actionText}>New Post</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleFoodJournal}>
        <Text style={styles.actionText}>Personal Food Journal</Text>
      </TouchableOpacity>
      
    </View>
  );
};

// Styles for the ProfileScreen
const styles = StyleSheet.create({
});

export default ProfileScreen;


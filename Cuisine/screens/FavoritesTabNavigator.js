import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FavoriteRestaurantScreen from './FavoriteRestaurantScreen';
import FavoritePostsScreen from './FavoritePostsScreen'; // New component for favorite posts

const Tab = createMaterialTopTabNavigator();

const FavoritesTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Restaurants" component={FavoriteRestaurantScreen} />
      <Tab.Screen name="Posts" component={FavoritePostsScreen} />
    </Tab.Navigator>
  );
};

export default FavoritesTabNavigator;

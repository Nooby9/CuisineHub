import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { screenOptions } from './style';
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import PostEditorScreen from './screens/PostEditorScreen';
import ProfileScreen from './screens/ProfileScreen';
import FoodJournalScreen from './screens/FoodJournalScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator component
function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...screenOptions,
      contentStyle: {
        backgroundColor: "white",
      },
    })}>
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => (<AntDesign name="home" size={24} color="black" />) }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color, size }) => (<AntDesign name="search1" size={24} color="black" />) }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="person-outline" size={24} color="black" />) }}
      />
    </Tab.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={({ route }) => ({
        ...screenOptions,
        contentStyle: {
          backgroundColor: "white",
        },
      })}>
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Post" component={PostScreen} options={{ title: 'Post Details' }} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: 'Restaurant Details' }} />
        <Stack.Screen name="New Post" component={PostEditorScreen} />
        <Stack.Screen name="Edit Post" component={PostEditorScreen} />
        <Stack.Screen name="Food Journal" component={FoodJournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

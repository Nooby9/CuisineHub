import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image, StyleSheet } from 'react-native';
import { writeToDB } from './Firebase/firestoreHelper';
import AntDesign from '@expo/vector-icons/AntDesign';
import { screenOptions } from './style';
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';

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
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon:({ color, size }) => ( <AntDesign name="home" size={24} color="black" />) }}
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

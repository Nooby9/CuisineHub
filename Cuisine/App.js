import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { screenOptions } from './style';
import DiscoverScreen from './screens/DiscoverScreen';
import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import PostEditorScreen from './screens/PostEditorScreen';
import ProfileScreen from './screens/ProfileScreen';
import FoodJournalScreen from './screens/FoodJournalScreen';
import SavedPostsScreen from './screens/FavoriteScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebaseSetup';
import { useEffect, useState } from 'react';
import FavoriteScreen from './screens/FavoriteScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        contentStyle: {
          backgroundColor: "white",
        },
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
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

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const AppStack = (
  <>
    <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
    <Stack.Screen name="Post" component={PostScreen} options={{ title: 'Post Details' }} />
    <Stack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: 'Restaurant Details' }} />
    <Stack.Screen name="New Post" component={PostEditorScreen} />
    <Stack.Screen name="Edit Post" component={PostEditorScreen} />
    <Stack.Screen name="Food Journal" component={FoodJournalScreen} />
    <Stack.Screen name="Favorites" component={FavoriteScreen} />
  </>
);

export default function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsUserAuthenticated(!!user);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isUserAuthenticated ? (
          AppStack
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

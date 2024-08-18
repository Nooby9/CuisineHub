import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../style';
import { getUserInfoDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Watch for authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch user info from the database whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const fetchUserInfo = async () => {
        if (user) {
          const userData = await getUserInfoDB(user.uid);
          setUserInfo(userData);
        }
        setLoading(false); // Set loading to false after fetching data
      };
      fetchUserInfo();
    }, [user])
  );

  const handleNewPost = () => {
    navigation.navigate('New Post');
  };

  const handleFoodJournal = () => {
    navigation.navigate('Personal Food Journal');
  };

  const handleFavorites = () => {
    navigation.navigate('Favorites');
  };

  const handleEditProfile = () => {
    navigation.navigate('Edit Profile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: userInfo?.profileImage || 'https://via.placeholder.com/150' }} // Profile image fetched from database
        style={styles.profilePicture}
      />
      <Text style={styles.profileName}>{userInfo?.username || 'User Name'}</Text>
      <Text style={styles.profileName}>{auth.currentUser.email || 'User Email'}</Text>
      <Text style={styles.profileBio}>{userInfo?.bio || 'User Bio'}</Text> 
      <View style={styles.editButtonContainer}>
        <PressableButton onPress={handleEditProfile}>
          <Ionicons name="pencil" size={24} color={colors.primary} />
        </PressableButton>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleNewPost}>
        <Text style={styles.actionText}>New Post</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleFoodJournal}>
        <Text style={styles.actionText}>Personal Food Journal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleFavorites}>
        <Text style={styles.actionText}>Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signoutButton} onPress={() => {
        try {
          signOut(auth);
        } catch (error) {
          console.log("Error signing out: ", error);
        }
      }}>
        <Text style={styles.signoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileBio: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  editButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
  },
  actionButton: {
    backgroundColor: 'lemonchiffon',
    padding: 15,
    marginTop: 10,
    width: '90%',
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  signoutButton: {
    backgroundColor: 'red',
    padding: 15,
    marginTop: 10,
    width: '90%',
    borderRadius: 10,
    alignItems: 'center',
  },
  signoutText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ProfileScreen;

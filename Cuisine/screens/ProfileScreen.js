import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../components/PressableButton';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../style';
import { getUserInfoDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        console.log(user.uid);
        const userData = await getUserInfoDB(user.uid);
        setUserInfo(userData);
      };
      fetchUserInfo();
    }
  }, [user]);

  const handleNewPost = () => {
    navigation.navigate('New Post');
  };

  const handleFoodJournal = () => {
    navigation.navigate('Food Journal');
  };

  const handleSavedPosts = () => {
    navigation.navigate('Saved Posts');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleEditProfile = () => {
    navigation.navigate('Edit Profile');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.profileName}>Welcome! Please log in or sign up to access your profile.</Text>
        <Button title="Login" onPress={handleLogin} />
        <Button title="Signup" onPress={handleSignup} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: userInfo?.photoUrl || 'https://via.placeholder.com/150' }}
        style={styles.profilePicture}
      />
      <Text style={styles.profileName}>{userInfo?.name || 'User Name'}</Text>
      <Text style={styles.profileName}>{auth.currentUser.email || 'User Email'}</Text>
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

      <TouchableOpacity style={styles.actionButton} onPress={handleSavedPosts}>
        <Text style={styles.actionText}>Saved Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleNotifications}>
        <Text style={styles.actionText}>Notifications</Text>
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
});

export default ProfileScreen;

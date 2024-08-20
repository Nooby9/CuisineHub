import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { updateUserInfo, getUserInfoDB } from '../Firebase/firestoreHelper'; // Import your helper functions
import { auth, storage } from '../Firebase/firebaseSetup';
import { colors } from '../style';
import { ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [response, requestPermission] = ImagePicker.useCameraPermissions();
  const [phoneError, setPhoneError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfoDB(auth.currentUser.uid);
        if (userData) {
          setUsername(userData.username || '');
          setBio(userData.bio || '');
          setPhone(userData.phone || '');
          setImage(userData.profileImage || null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (validatePhoneNumber(phone)) {
      const updatedInfo = {
        username,
        bio,
        phone,
        profileImage: imageUri || image,
      };

      try {
        await updateUserInfo(auth.currentUser.uid, updatedInfo);
        navigation.goBack();
      } catch (error) {
        Alert.alert('There was a problem updating your profile. Please try again!', error.message);
      }
    } else {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number that is 10 digits.');
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/; // Adjust this to fit your phone number format
    const isValid = phoneRegex.test(phone);
    setPhoneError(!isValid ? 'Please enter a valid phone number that is 10 digits' : null);
    return isValid;
  };

  async function deleteImageFromStorage(imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  async function uploadImageToStorage(imageUri) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `profile_images/${imageName}`);

      const uploadResult = await uploadBytesResumable(imageRef, blob);
      return uploadResult.metadata.fullPath;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'There was an error uploading the image.');
    }
  }

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Media Library Permission Required', 'Please grant media library permission to use this feature.');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      Alert.alert('Permission required', 'You need to grant permission to access the camera roll.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      const uploadedImagePath = await uploadImageToStorage(result.assets[0].uri);
      setImage(uploadedImagePath);
    }
  };

  async function verifyPermissions() {
    if (response.granted) {
      return true;
    }
    const permissionResponse = await requestPermission();
    return permissionResponse.granted;
  }

  const takePhotoWithCamera = async () => {
    try {
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert("You need to give permission to launch the camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        const uploadedImagePath = await uploadImageToStorage(result.assets[0].uri);
        setImage(uploadedImagePath);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'A simulator does not have a camera. Please try on a physical device.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Edit Profile</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
      ) : image ? (
        <Image source={{ uri: image }} style={styles.profileImage} />
      ) : (
        <Text style={styles.text}>No profile image selected</Text>
      )}

      <TouchableOpacity style={styles.imageButton} onPress={pickImageFromGallery}>
        <Text style={styles.imageButtonText}>Select Image from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.imageButton} onPress={takePhotoWithCamera}>
        <Text style={styles.imageButtonText}>Take Photo</Text>
      </TouchableOpacity>

      <Text style={styles.text}>Username</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#999"
        />
      </View>

      <Text style={styles.text}>Bio</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor="#999"
        />
      </View>

      <Text style={styles.text}>Phone Number</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, phoneError ? styles.errorBorder : null]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          onBlur={() => validatePhoneNumber(phone)}
        />
        {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  errorBorder: {
    borderColor: 'red',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: colors.favorite,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.favorite,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  imageButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default EditProfileScreen;

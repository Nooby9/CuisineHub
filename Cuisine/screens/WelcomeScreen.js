import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../style';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
        <Image source={require('../assets/WelcomePageImage.png')} style={{width: 300, height: 300}}/>
      <Text style={styles.title}>Welcome to CuisineHub!</Text>
      <Text style={styles.subtitle}>
        Discover the best dining spots and share your own restaurant experiences with our community.
      </Text>
      <Text style={styles.description}>
        Whether you're looking for new places to eat or want to share your favorite spots with others,
        CuisineHub is here to help you find and connect with the best restaurants around.
      </Text>
      <Text style={styles.callToAction}>Join our community today:</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      
      <Pressable style={styles.button} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  description: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#777',
    paddingHorizontal: 20,
  },
  callToAction: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.textLight,
  },
  button: {
    backgroundColor: colors.favorite,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;

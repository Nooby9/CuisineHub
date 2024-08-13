import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { auth } from '../Firebase/firebaseSetup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { database } from '../Firebase/firebaseSetup'; 
import { doc, setDoc } from 'firebase/firestore';
import PressableButton from '../components/PressableButton';
import { colors } from '../style';
import PasswordStrengthMeterBar from 'react-native-password-strength-meter-bar';

export async function writeWithIdToDB(data, collectionName, id){
  try {
    await setDoc(doc(database, collectionName, id), data, { merge: true });
  } catch (e) {
    console.error("Writing to database with id error: ", e);
  }
}

const SignupScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const loginHandler = () => {
        navigation.replace('Login');
    };

    const signupHandler = async () => {
        if (username === '') {
            Alert.alert('Username cannot be empty');
            return;
        }
        if (email === '') {
            Alert.alert('Email cannot be empty');
            return;
        }
        if (password === '') {
            Alert.alert('Password cannot be empty');
            return;
        }
        if (confirmPassword === '') {
            Alert.alert('Confirm Password cannot be empty');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('User created: ', user);

                const userData = { username: username, email: email };
                await writeWithIdToDB(userData, 'User', user.uid);

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error: ', errorMessage);
                if (errorCode === 'auth/email-already-in-use') {
                    Alert.alert('That email is already in use!');
                } else if (errorCode === 'auth/weak-password') {
                    Alert.alert('The password is too weak');
                } else if (errorCode === 'auth/invalid-email') {
                    Alert.alert('The email is invalid');
                } else if (errorCode === 'auth/missing-password') {
                    Alert.alert('Password is missing');
                }
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Signup</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder='Password'
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <PasswordStrengthMeterBar password={password} />
            <TextInput
                placeholder='Confirm Password'
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
            />
            <PressableButton onPress={signupHandler} style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Register</Text>
            </PressableButton>
            <PressableButton onPress={loginHandler} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Already Registered? Login</Text>
            </PressableButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: colors.favorite,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    registerButton: {
        backgroundColor: 'black',
        marginBottom: 10,
    },
    registerButtonText: {
        fontSize: 16,
        color: 'white',
    },
    loginButton: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
    },
    loginButtonText: {
        fontSize: 16,
        color: 'black',
    },
});

export default SignupScreen;

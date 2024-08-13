import React from 'react';
import { StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { auth } from '../Firebase/firebaseSetup';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import PressableButton from '../components/PressableButton';
import { colors } from '../style';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const signupHandler = () => {
        navigation.replace('Signup');
    };

    const loginHandler = async () => {
        if (email === '') {
            Alert.alert('Email cannot be empty');
            return;
        }
        if (password === '') {
            Alert.alert('Password cannot be empty');
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User logged in: ', user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error: ', errorMessage);
                if (errorCode === 'auth/user-not-found') {
                    Alert.alert('User not found');
                } else if (errorCode === 'auth/wrong-password') {
                    Alert.alert('Wrong password');
                } else if (errorCode === 'auth/invalid-email') {
                    Alert.alert('Invalid email');
                }
            });
    };

    const forgotPasswordHandler = () => {
        if (email === '') {
            Alert.alert('Please enter your Email to receive a reset password link');
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert('Password reset email sent. Please check your email inbox to reset your password');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error: ', errorMessage);
                if (errorCode === 'auth/user-not-found') {
                    Alert.alert('User not found');
                } else if (errorCode === 'auth/invalid-email') {
                    Alert.alert('Invalid email');
                }
            });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcom to CuisineHub!</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                style={styles.input}
            />
            <PressableButton onPress={loginHandler} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Log In</Text>
            </PressableButton>
            <PressableButton onPress={signupHandler} style={styles.signupButton}>
                <Text style={styles.signupButtonText}>New User? Create an account</Text>
            </PressableButton>
            <PressableButton onPress={forgotPasswordHandler} style={styles.forgotPasswordButton}>
                <Text style={styles.signupButtonText}>Forgot Password?</Text>
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
    loginButton: {
        backgroundColor: 'black',
        marginBottom: 10,
    },
    loginButtonText: {
        fontSize: 16,
        color: 'white',
    },
    signupButton: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
    },
    signupButtonText: {
        fontSize: 16,
        color: 'black',
    },
    forgotPasswordButton: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
    },
});

export default LoginScreen;

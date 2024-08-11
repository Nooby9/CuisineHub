import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native'
import React from 'react'
import { auth } from '../Firebase/firebaseSetup'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const SignupScreen = ({navigation}) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const loginHandler = () => {
        navigation.replace('Login');
    }

    const signupHandler = async () => {
        if (email === ''){
            Alert.alert('Email cannot be empty');
            return;
        }
        if (password === ''){
            Alert.alert('Password cannot be empty');
            return;
        }
        if (confirmPassword === ''){
            Alert.alert('Confirm Password cannot be empty');
            return;
        }
        if (password !== confirmPassword){
            Alert.alert('Passwords do not match');
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User created: ", user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error: ", errorMessage);
            if (errorCode === 'auth/email-already-in-use') {
               Alert.alert('That email is already in use!');
            }
            else if(errorCode === 'auth/weak-password'){
                Alert.alert('The password is too weak');
            } else if (errorCode === 'auth/invalid-email'){
                Alert.alert('The email is invalid');
            } else if (errorCode === 'auth/missing-password'){
                Alert.alert('Password is missing');
            }
        });
    }

  return (
    <View style={styles.container}>
      <Text>Sigup</Text>
        <TextInput
            placeholder="Email"
            value={email}
            onChangeText={changedText => setEmail(changedText)}
            style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
            }}
        />
        <TextInput
            placeholder='Password'
            secureTextEntry={true}
            value={password}
            onChangeText={changedText => setPassword(changedText)}
            style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
            }}
        />
        <TextInput
            placeholder='Confirm Password'
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={changedText => setConfirmPassword(changedText)}
            style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
            }}
        />
        <Button title='Register' onPress={()=>signupHandler()}/>
        <Button title='Already Registered? Login' onPress={()=>loginHandler()}/>
    </View>
  )
}

export default SignupScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    }
})
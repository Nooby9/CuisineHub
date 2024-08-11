import { StyleSheet, Text, View, Button, TextInput} from 'react-native'
import React from 'react'
import { auth } from '../Firebase/firebaseSetup'
import { signInWithEmailAndPassword } from 'firebase/auth'

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const signupHandler = () => {
        navigation.replace('Signup');
    }

    const loginHandler = async () => {
        if (email === ''){
            Alert.alert('Email cannot be empty');
            return;
        }
        if (password === ''){
            Alert.alert('Password cannot be empty');
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User logged in: ", user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error: ", errorMessage);
            if (errorCode === 'auth/user-not-found') {
                Alert.alert('User not found');
            } else if (errorCode === 'auth/wrong-password'){
                Alert.alert('Wrong password');
            } else if (errorCode === 'auth/invalid-email'){
                Alert.alert('Invalid email');
            }
        });
    }
  return (
    <View style={styles.container}>
      <Text>Login</Text>
        <TextInput
            placeholder="Email"
            value = {email}
            onChangeText = {changedText => setEmail(changedText)}
            style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
            }}
        />
        <TextInput
            secureTextEntry={true}
            value = {password}
            onChangeText = {changedText => setPassword(changedText)}
            placeholder='Password'
            style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1
            }}
        />
        <Button title='Log In' onPress={()=>loginHandler()}/>
        <Button title='New User? Create an account' onPress={()=>signupHandler()}/>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    }
})
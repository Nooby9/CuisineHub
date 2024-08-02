// components/PressableButton.js
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../style';

// PressableButton component: renders a button with a press effect and children elements
const PressableButton = ({ children, onPress }) => {
    return (
        <Pressable
            android_ripple={{ color: colors.rippleEffect }}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                },
                styles.button,
            ]}
            onPress={onPress}
        >
            <View>
                {children}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        marginRight: 15,
    },
});

export default PressableButton;

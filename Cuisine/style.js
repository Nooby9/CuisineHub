import { StyleSheet } from 'react-native';

// Define colors for the app
export const colors = {
    background: '#fff',
    currentLocation: 'blue',
    textDark: '#333',
    orchidBG: 'mediumorchid',
    headerText: '#FFFFFF',
    rippleEffect: 'darkseagreen',
    alertIcon: '#FFD700',
    border: '#ccc',
    borderBottom: '#eee',
    postButtonBg: '#ff3b30',
    pressedButton: '#aaa',
    buttonText: '#ffffff',
    favorite: 'hotpink',
    notFavorite: '#AAA'
};
// Define common styles used across the app
export const commonStyles = StyleSheet.create({
    likeSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardLikes: {
        fontSize: 14,
        color: '#777',
    },
})

// Define screen options for navigators
export const screenOptions = {
    headerStyle: {
        backgroundColor: colors.orchidBG,
    },
    headerTintColor: colors.headerText,
    tabBarStyle: { backgroundColor: colors.orchidBG },
    tabBarActiveTintColor: colors.alertIcon,
    tabBarInactiveTintColor: colors.headerText,
};
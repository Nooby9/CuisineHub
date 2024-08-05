import { StyleSheet } from 'react-native';

// Define colors for the app
export const colors = {
    primary: '#6200EE',
    secondary: '#03DAC6',
    backgroundLight: '#D8BFD8',
    backgroundDark: 'mediumpurple',
    textLight: '#4B0082',
    textDark: '#FFFFFF',
    orchidBG: 'mediumorchid',
    headerText: '#FFFFFF',
    rippleEffect: 'darkseagreen',
    alertIcon: '#FFD700',
    leftButton: "#8B0000",
    rightButton: "#4B0082",
    itemBackground: '#4B0082',
    itemText: '#4B0082',
    itemTextBG: '#FFFFFF',
    inputBorder: '#4B0082',
    checkedCheckbox: '#4630EB',
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
/* Import utilities. */
import { StyleSheet } from "react-native";

/**
 * This file is used to encapsulate all global 
 * styles for the application.
 * 
 * Styles will either be exported as react-native 
 * stylesheets or objects containing necessary 
 * values.
 */
export const gatsbyColours = {
    white: '#FFFFFF',
    grey: '#CCCCCC',
    black: '#000000',
    gold: '#FFB809',
    red: '#F92727',
    green: '#18F321'
}

export const textStyles = StyleSheet.create({
    smallText: {
        fontFamily: 'System',
        fontSize: 12,
        color: gatsbyColours.black,
    },
    mediumText: {
        fontFamily: 'System',
        fontSize: 16,
        color: gatsbyColours.black,
    },
    largeText: {
        fontFamily: 'System',
        fontSize: 24,
        color: gatsbyColours.black,
    },
    profileSection: {
        fontFamily: 'System',
        fontSize: 32,
        color: gatsbyColours.gold,
        fontWeight: '800',
    }
})





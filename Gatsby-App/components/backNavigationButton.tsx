/* Import utilities. */
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from "react-native";
import { Image } from 'expo-image';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { BackNavigationButtonProps } from "../types/UiComponentTypes";

/**
 * Custom icon button used to route user to previous page.
 * @param onPress 
 * @returns back navigation component.
 */
export default function BackNavigationButton({onPress}: BackNavigationButtonProps){
    return(
        <TouchableOpacity style={styles.backButton} onPress={onPress}>
            <Image
                source={require('../assets/Utilities/BackNavigationArrow.png')}
                style={{height:30, width:20, objectFit:'contain'}}
                cachePolicy={'memory'}
            />
        </TouchableOpacity>
    );
}

/* Component Styles */
const styles = StyleSheet.create({
    backButton:{
        margin: '12.5%',
        width: 20,
        height: 30
    },
})
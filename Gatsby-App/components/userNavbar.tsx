/* Import utilities. */
import { TouchableOpacity, View, StyleSheet} from "react-native";
import { Image } from 'expo-image';
import { router } from "expo-router";
import { useEffect, useState } from "react";

/* Import Component Types */
import { NavbarProps } from "../types/UiComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/**
 * Defines User navigation bar component.
 * State of component is defined by page
 * the user has selected (Home, explore,
 * tickets, profile)
 * @returns User Navigation Bar
 */
export default function UserNavbar({isParentScrolling, navigationState}: NavbarProps){    
    // Navigation state.
    const [navState, setNavState] = useState(navigationState);

    // Opacity state
    const [isScrolling, setIsScrolling] = useState(isParentScrolling);

    useEffect(()=>{
        setIsScrolling(isParentScrolling);
    }, [isParentScrolling])

    /* NAVIGATION */

    // Home.
    const navigateToHome = () => {
        setIsScrolling(false);
        router.push('/(app)/user/(home)/userHome');
    }

    // Explore.
    const navigateToExplore = () => {
        setIsScrolling(false);
        router.push('/(app)/user/(explore)/explore');
    }

    // Ticket wallet.
    const navigateToTicketWallet = () => {
        setIsScrolling(false);
        router.push('/(app)/user/(ticketWallet)/ticketWallet');
    }

    // Profile.
    const navigateToProfile = () => {
        setIsScrolling(false);
        router.push('/(app)/user/(profile)/accountProfile');
    }

    // Empty function for when account in current path.
    const empty = () => {}

    return(
        /**
         * Define Navbar component in absolute position.
         * 
         * Use state to highlight icon during navigation.
         */
        <View style={{
            position: 'absolute',
            bottom: '2.5%',
            alignSelf: 'center',
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            height: '9%',
            width: '95%',
            padding: '0%',
            borderRadius: 30,
            borderWidth: 3,
            justifyContent: 'center',
            opacity: isScrolling? 0.3:1,
            zIndex: 5
        }}>
            {/* Navbar icon container */}
            <View style={styles.navContainer}>
                {/* Home */}
                <TouchableOpacity onPress={navState === 'home'? empty : navigateToHome}>
                    <Image
                        source={require('../assets/Utilities/HomeIcon.png')}
                        style={styles.icon}
                        tintColor={navState === 'home'? GatsbyStyles.gatsbyColours.gold : GatsbyStyles.gatsbyColours.black}
                        cachePolicy={'memory'}
                    />
                </TouchableOpacity>

                {/* Explore */}
                <TouchableOpacity onPress={navState === 'explore'? empty : navigateToExplore}>
                    <Image
                        source={require('../assets/Utilities/SearchIcon.png')}
                        style={styles.icon}
                        tintColor={navState === 'explore'? GatsbyStyles.gatsbyColours.gold : GatsbyStyles.gatsbyColours.black}
                        cachePolicy={'memory'}
                    />
                </TouchableOpacity>

                {/* Ticket Wallet */}
                <TouchableOpacity onPress={navState === 'ticketWallet'? empty : navigateToTicketWallet}>
                    <Image
                        source={require('../assets/Utilities/TicketIcon.png')}
                        style={styles.ticketIcon}
                        tintColor={navState === 'ticketWallet'? GatsbyStyles.gatsbyColours.gold : GatsbyStyles.gatsbyColours.black}
                        cachePolicy={'memory'}
                    />
                </TouchableOpacity>

                {/* Profile */}
                <TouchableOpacity onPress={navState === 'profile'? empty : navigateToProfile}>
                    <Image
                        source={require('../assets/Utilities/ProfileIcon.png')}
                        style={styles.icon}
                        tintColor={navState === 'profile'? GatsbyStyles.gatsbyColours.gold : GatsbyStyles.gatsbyColours.black}
                        cachePolicy={'memory'}
                    />
                </TouchableOpacity>

            </View>

        </View>
    );
}

/* Component Styles */
const styles = StyleSheet.create({
    navContainer: {
        width: 'auto',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems:'center',
    },
    icon: {
        width: 40,
        height: 40,
        objectFit: 'contain'
    },
    ticketIcon: {
        width: 45,
        height: 40,
        objectFit: 'contain'
    }
})

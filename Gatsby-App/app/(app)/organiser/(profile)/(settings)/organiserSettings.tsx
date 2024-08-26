/* Import utilities. */
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

/* Import Custom Components */
import BackNavigationButton from "../../../../../components/backNavigationButton";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIREBASE_AUTH } from "../../../../../firebaseConfig";
import { signOut } from "firebase/auth";

/**
 * Organiser account settings page,
 * allows organiser to control account
 * parameters.
 * 
 * @returns Organiser settings page.
 */
export default function OrganiserSettings(){
    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    return(
        /**
         * Wrap screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1,
        }}>

            {/* Screen Content */}

            {/* Back Button */}
            <View style={{position: 'absolute', top: '7.5%', left: '0%', zIndex: 3}}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {/* Settings buttons */}
            <View style={styles.container}>

                {/* Log out button */}
                <TouchableOpacity 
                    style={styles.logoutContainer} 
                    onPress={() => {
                        signOut(FIREBASE_AUTH);
                    }}>
                    <Text style={{
                            color: GatsbyStyles.gatsbyColours.white, 
                            fontSize: 20,
                            fontWeight: '600'
                        }}>
                        Log out
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    container:{
        width: '90%',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    logoutContainer:{
        width: '90%',
        height: '27.5%',
        backgroundColor: GatsbyStyles.gatsbyColours.red,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        top: '20%'
    }
})
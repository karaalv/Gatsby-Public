/* Import utilities */
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAuthContext } from "../utilities/sessionProvider";
import { useAccountTypeContext } from "../utilities/accountTypeProvider";
import { useEffect, useState } from "react";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { InboxCardProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/**
 * Used to render each message card in an accounts 
 * inbox page.
 * 
 * @param {InboxCardProps}
 * @returns Info box component.
 */
export default function InboxCard({isRead, accountID, accountType, chatID, latestMessage}: InboxCardProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();
    // Obtain sending account type from hook.
    const accountObservingType = useAccountTypeContext();

    // Account details.
    const [username, setUsername] = useState(null);
    const [image, setImage] = useState(null);

    // Fetch account data.
    useEffect(() => {
        const fetch = async () => {
            const data = await pullAccountInfo({accountID: accountID, context: accountType});
            if(data){
                setUsername(data.username);
                if(accountType === 'user'){
                    setImage(data.profileImage);
                } else {
                    setImage(data.organiserLogo);
                }
            } else {
                // Handle null data.
            }
        }
        fetch();
    }, [])
    
    // Route to messages, set message as read.
    const routeToMessages = () => {
        router.push({
            pathname: `(app)/${accountObservingType}/(home)/(message)/message`,
            params: {recipientID: accountID, recipientAccountType: accountType}
        })
    }

    return(
        // Container.
        <View style={styles.container}>
            <TouchableOpacity style={styles.styleContainer} activeOpacity={0.45} onPress={routeToMessages}>
                {/* Info box Content */}
                <View style={styles.arrangement}>
                    {/* Image */}
                    <Image
                        source={{uri: image}}
                        style={accountType === 'user'? styles.imageProfile: styles.imageLogo}
                    />

                    {/* Text */}
                    <View style={{left: '0%', justifyContent: 'space-evenly', height: 75, width: '70%', flexWrap:'wrap'}}>

                        {/* Heading */}
                        <Text style={{
                            fontWeight: isRead? 'bold' : '700', 
                            fontSize: 22, 
                            width: '100%', 
                            flexWrap: 'wrap',
                            color: isRead? GatsbyStyles.gatsbyColours.black : GatsbyStyles.gatsbyColours.gold
                            }}>
                            {username}
                        </Text>

                        {/* Subheading */}
                        <Text style={{fontSize: 16, width: '100%', flexWrap: 'wrap'}}>
                            {latestMessage}
                        </Text>

                    </View>

                </View>
            </TouchableOpacity>
        </View>
    )
}

/* Component Styles */
const styles = StyleSheet.create({
    container: {
        width: '95%',
        height: 'auto',
        alignSelf: 'center',
    },
    styleContainer: {
        height: 'auto',
        width: '85%',
        borderWidth: 3,
        padding: '3%',
        justifyContent: 'center',
        borderRadius: 10,
    },
    imageLogo: {
        height: 45,
        width: 45,
        objectFit: 'contain',
        borderWidth: 3,
        borderRadius: 5,
    },
    imageProfile: {
        height: 50,
        width: 50,
        objectFit: 'contain',
        borderRadius: 50,
        borderWidth: 3
    },
    forwardNavigationArrow: {
        height: 40,
        width: 20,
        objectFit: 'contain',
    },
    arrangement:{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})


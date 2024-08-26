/* Import utilities */
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { TicketBoxProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo, pullEvent } from "../scripts/GatsbyFirestoreFunctions";

/**
 * This component is used to display a users 
 * purchased tickets within their ticket wallet.
 * 
 * @param {TicketBoxProps}
 * @returns Info box component.
 */
export default function TicketBox({ticketID, eventID, organiserID}: TicketBoxProps){

    /* FIRESTORE */
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [organiserLogoURL, setOrganiserLogoURL] = useState(null);

    // Define routing callback.
    const routerCallback = () => {
        router.push({
            pathname: '(app)/user/(ticketWallet)/(ticketInfo)/ticketInfo',
            params: {eventID: eventID, ticketID: ticketID, organiserID: organiserID}
        })
    }

    // fetch data.
    useEffect(() => {
        const fetch =  async () => {
            const eventData = await pullEvent({eventIDArg: eventID});
            const organiserData = await pullAccountInfo({accountID: organiserID, context: 'organiser'});
            if(eventData && organiserData){
                setEventName(eventData.eventName);
                setEventDate(eventData.eventDate);
                setOrganiserLogoURL(organiserData.organiserLogo);
            } else {
                // Raise network error.
            }
        }
        fetch();
    }, [])

    return(
        // Container.
        <View style={styles.container}>
            <TouchableOpacity style={styles.styleContainer} activeOpacity={0.45} onPress={() => routerCallback()}>
                {/* Info box Content */}
                <View style={styles.arrangement}>
                    {/* Image */}
                    <Image
                        source={{uri: organiserLogoURL}}
                        style={styles.imageLogo}
                    />

                    {/* Text */}
                    <View style={{left: '5%', justifyContent: 'space-evenly', height: 75, width: '70%', flexWrap:'wrap'}}>

                        {/* Heading */}
                        <Text style={{fontWeight: 'bold', fontSize: 16, width: '100%', flexWrap: 'wrap',}}>
                            {eventName}
                        </Text>

                        {/* Subheading */}
                        <Text style={{fontSize: 14, width: '100%', flexWrap: 'wrap'}}>
                            {eventDate}
                        </Text>

                    </View>

                    {/* Forward Arrow */}
                    <TouchableOpacity activeOpacity={0.45} onPress={() => routerCallback()}>
                        <Image
                            source={require('../assets/Utilities/ForwardNavigationArrow.png')}
                            style={styles.forwardNavigationArrow}
                        />
                    </TouchableOpacity>

                </View>
            </TouchableOpacity>
        </View>
    )
}

/* Component Styles */
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 'auto',
        alignSelf: 'center',
    },
    styleContainer: {
        height: 'auto',
        width: '85%',
        borderWidth: 3,
        padding: 10,
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


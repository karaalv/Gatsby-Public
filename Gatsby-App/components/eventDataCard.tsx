/* Import utilities. */
import { 
    TouchableOpacity, Text, StyleSheet, 
    View, FlatList, ActivityIndicator 
} from "react-native";
import { Image, ImageSource } from "expo-image";
import  { useState, useEffect } from "react";
import { router, useLocalSearchParams} from "expo-router";
import { useAuthContext } from "../utilities/sessionProvider";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { EventDataCardProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/**
 * This component encapsulates event data
 * into a single card used; this card is
 * used to represent the event on the
 * organisers event dashboard.
 * 
 * @param {EventDataCardProps} 
 * @returns Event data card component.
 */
export default function EventDataCard({eventName, eventDate, eventBanner, 
    revenue, ticketsSold, organiserLogo, tag, eventID}: EventDataCardProps){
    
    // Fetch organiser details.
    const { user } = useAuthContext();

    // Organiser info.
    const [organiserLogoURL, setOrganiserLogoURL] = useState(null);

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrganiserLogo = async () => {
            const {organiserLogo} = await pullAccountInfo({accountID: user.uid, context: 'organiser'});

            // Check loading error.
            if(organiserLogo === null || organiserLogo === undefined){
                setLoadingError(true);
            } else{
                setOrganiserLogoURL(organiserLogo);
            }
            setIsLoading(false);
        }
        fetchOrganiserLogo();
    }, [])

    // Contain event tag in state.
    let tagBackgroundColour = 'rgba(204, 204, 204, 0.6)';

    if(tag == 'upcoming'){
        tagBackgroundColour = 'rgba(255, 184, 9, 0.6)';

    } else if(tag == 'live'){
        tagBackgroundColour = 'rgba(24, 243, 33, 0.6)';
    }

    // Router to event data page.
    const routerCallback = () => {
        router.push({
            pathname: '(app)/organiser/(dashboard)/(eventDataPage)/eventDataPage',
            params: {eventID: eventID}
        })
    }

    /* RENDER CALLBACKS */

    const loading = () => {
        return(
            <ActivityIndicator style={{top: '40%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    const loadingEventCardError = () => {
        return(
            <View style={{
                flexDirection: 'row', 
                position: 'absolute',
                top: '50%',
                alignSelf: 'center',
                alignItems: 'center',
                }}>
                <Image
                    source={require('../assets/Utilities/ErrorIcon.png')}
                    style={{
                        width: 30,
                        height: 30,
                        objectFit: 'contain',
                        tintColor: GatsbyStyles.gatsbyColours.red
                    }}
                />
                <Text style={{
                    fontSize: 16, 
                    fontWeight: '700',
                    color: GatsbyStyles.gatsbyColours.red,
                    marginLeft: '10%'
                }}>
                    Network error 
                </Text>
            </View>
        )
    }

    return(
        // Container.
        <TouchableOpacity 
            style={styles.eventDataCardContainer}
            onPress={routerCallback}
            activeOpacity={0.7}>

            {
                isLoading?
                    loading()
                :
                    loadingError?
                        loadingEventCardError()
                    :
                        <View style ={{width: '100%', height: '100%'}}>
                            {/* Organiser logo */}
                            <View style={{
                                backgroundColor: GatsbyStyles.gatsbyColours.white, 
                                zIndex: 1, 
                                width: 25, 
                                height: 25, 
                                margin: '2.5%', 
                                position: 'absolute', 
                                top: '0%', 
                                borderRadius: 5
                                }}>
                                <Image
                                    source={{uri: organiserLogoURL}}
                                    style ={{
                                        height: '100%',
                                        width: '100%', 
                                        objectFit: 'contain',
                                        borderWidth: 2, 
                                        borderRadius: 5,
                                    }}
                                /> 
                            </View>

                            {/* Event tag */}
                            <View style={{
                                position: 'absolute',
                                top: '0%',
                                right: '0%',
                                margin: '5%',
                                width: 'auto',
                                height: 5,
                                justifyContent: 'center',
                                borderRadius: 15,
                                backgroundColor: tagBackgroundColour,
                                paddingHorizontal: '3%',
                                zIndex: 1
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    alignSelf: 'center',
                                    color: tag == 'upcoming'? GatsbyStyles.gatsbyColours.white: GatsbyStyles.gatsbyColours.black
                                }}>
                                    {tag}
                                </Text>
                            </View>

                            {/* Event banner */}
                            <View style={styles.bannerContainer}>
                                <Image
                                    source={eventBanner}
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'contain',
                                        borderTopLeftRadius: 6,
                                        borderTopRightRadius: 6,
                                    }}
                                />
                            </View>

                            {/* Event Info */}
                            <View style={styles.infoContainer}>

                                {/* Event name */}
                                <Text style={{
                                    margin: '3%',
                                    marginBottom: '0%', 
                                    fontWeight: 'bold', 
                                    height: 'auto', 
                                    width: '100%', 
                                    flexWrap: 'wrap',
                                    fontSize: 18
                                }}>
                                    {eventName}
                                </Text>

                                {/* Event date */}
                                <Text style={{
                                    margin: '3%',
                                    fontWeight: '500', 
                                    height: 'auto', 
                                    width: '100%', 
                                    flexWrap: 'wrap',
                                    fontSize: 14
                                }}>
                                    {eventDate}
                                </Text>

                                {/* Tickets sold */}
                                <View style={{
                                        flexDirection: 'row',
                                        margin: '3%',
                                        marginTop: '1%',
                                        marginBottom: '2%',
                                        width: '100%',
                                        height: 'auto',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            fontSize: 18, 
                                            fontWeight: '600',
                                        }}>
                                            Tickets Sold:
                                        </Text>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            marginLeft: '5%',
                                            flexWrap: 'wrap',
                                            width: '60%',
                                            height: 'auto',
                                            color: GatsbyStyles.gatsbyColours.gold,
                                        }}>
                                            {ticketsSold}
                                        </Text>
                                    </View>

                                {/* Revenue */}
                                <View style={{
                                        flexDirection: 'row',
                                        margin: '3%',
                                        marginTop: '0%',
                                        width: '100%',
                                        height: 'auto',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            fontSize: 18, 
                                            fontWeight: '600',
                                        }}>
                                            Revenue:
                                        </Text>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            marginLeft: '5%',
                                            flexWrap: 'wrap',
                                            width: '60%',
                                            height: 'auto',
                                            color: GatsbyStyles.gatsbyColours.gold,
                                        }}>
                                            {`£ ${revenue}`}
                                        </Text>
                                    </View>
                            </View>
                        </View>
            }

        </TouchableOpacity>
    )
}

/* Component styles */
const styles = StyleSheet.create({
    eventDataCardContainer:{
        width: '90%',
        height: 280,
        borderWidth: 3,
        borderRadius: 10,
        alignSelf: 'center',
        flexDirection: 'column',
        zIndex: 1
    },
    bannerContainer:{
        width: '100%',
        height: '50%',
        borderBottomColor: GatsbyStyles.gatsbyColours.black,
        borderBottomWidth: 2
    },
    infoContainer:{
        width: '100%',
        height: '50%',
    }
})
/* Import utilities. */
import { 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    View,
    ActivityIndicator
} from "react-native";
import { Image } from "expo-image";
import  { useState, useEffect } from "react";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { EventCardProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/**
 * Render profile component.
 */
function ProfilePhotoComponent({accountID}){
    const [imageURL, setImageURL] = useState(null);
    const [loadingError, setLoadingError] = useState(false);
    useEffect(() => {
        const fetch = async () => {
            const {profileImage} = await pullAccountInfo({accountID: accountID, context: 'user'});
            if(profileImage === null || profileImage === undefined){
                setLoadingError(true);
            } else {
                setImageURL(profileImage);
            }
        }
        fetch();
    }, [])
    return(
        <View style={{margin: 5}}>
            <Image
                source={{uri: loadingError? null : imageURL}}
                style={{
                    height: 35,
                    width: 35, 
                    objectFit: 'contain',
                    borderWidth: 1, 
                    borderRadius: 35,
                }}
            />
        </View>
    )
}

/**
 * This component is used to encapsulate 
 * event information into a single 'card'
 * that is discoverable for other accounts.
 * 
 * @param {EventCardProps}
 * @returns Event card component
 */
export default function EventCard({createdBy, eventName, eventDate, eventCountry, eventCity, 
    eventBanner, numberOfOthers, attendees, routerCallback}: EventCardProps){
    
    // Organiser info.
    const [organiserLogoURL, setOrganiserLogoURL] = useState(null);

    // Attendee info.
    const [attendeeProfiles, setAttendeeProfiles] = useState<string[] | null>(null);

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch organiser logo.
        const fetchOrganiserLogo = async () => {
            const {organiserLogo} = await pullAccountInfo({accountID: createdBy, context: 'organiser'});

            // Check loading error.
            if(organiserLogo === null || organiserLogo === undefined){
                setLoadingError(true);
            } else{
                setOrganiserLogoURL(organiserLogo);
            }
            setIsLoading(false);
        }
        fetchOrganiserLogo();

        // Set event attendee profiles.
        const data = attendees.length > 3? attendees.slice(0,3) : attendees
        setAttendeeProfiles(data);

    }, [])
    
    // Render profile icon callback.
    const renderProfile = (item: string) => {
        return(
            <View key={item}>
                <ProfilePhotoComponent
                    accountID={item}
                />
            </View>
        )
    }

    // Render number of other profiles text.
    const renderFooter = () => {
        return(
            <View>
                <Text style={{
                    fontSize: 15, 
                    fontWeight: '700'
                }}>
                    {`+ ${numberOfOthers} others`}
                </Text>
            </View>
        )
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
            style={styles.eventCardContainer} 
            activeOpacity={0.7} 
            onPress={() => {
                routerCallback();
            }}
            >
            {
                isLoading?
                    loading()
                :
                    loadingError?
                        loadingEventCardError()
                    :
                        // Event card
                        <View style={{width: '100%', height: '100%'}}>
                            {/* Organiser logo */}
                            <View 
                                style={{
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

                            {/* Event banner */}
                            <View style={styles.bannerContainer}>
                                {/* Image */}
                                <Image
                                    source={{uri: eventBanner}}
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'contain',
                                        borderTopLeftRadius: 6,
                                        borderTopRightRadius: 6,
                                    }}
                                />
                            </View>

                            {/* Event info */}
                            <View style={styles.infoContainer}>

                                {/* Event name */}
                                <Text style={{
                                    padding: '2%',
                                    paddingBottom: 5, 
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
                                    padding: '2%',
                                    paddingLeft: 10, 
                                    fontWeight: '500', 
                                    height: 'auto', 
                                    width: '100%', 
                                    flexWrap: 'wrap',
                                    fontSize: 14
                                }}>
                                    {eventDate}
                                </Text>

                                {/* Location */}
                                <View style={{
                                    flexDirection: 'row', 
                                    width: '100%', 
                                    height: 'auto',
                                    padding: '2%', 
                                    paddingLeft: 10, 
                                    alignItems: 'center'
                                    }}>
                                    <Image
                                        source={require('../assets/Utilities/LocationIcon.png')}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            objectFit: 'contain',
                                            marginRight: 5
                                        }}
                                    />
                                    <Text style={{fontSize: 15}}>{eventCity}, {eventCountry}</Text>
                                </View>

                                {/* Event attendees */}
                                <View style={{
                                    flexDirection: 'row', 
                                    width: '100%', 
                                    height: 'auto',
                                    padding: '1%', 
                                    paddingLeft: 10,
                                    marginTop: 5, 
                                    alignItems: 'center',
                                }}>
                                    {attendeeProfiles && attendeeProfiles.length > 0 ?
                                        <View style={{flexDirection: 'row', alignSelf: 'center', alignItems: 'center'}}>
                                            <Text style={{fontSize: 15, fontWeight: '700'}}>
                                                People:
                                            </Text>
                                                {attendeeProfiles.map((item) => renderProfile(item))}
                                            <View> 
                                                {renderFooter()}
                                            </View>
                                        </View> 
                                    :
                                        <></>
                                    }

                                </View>
                            </View>
                        </View>
            }

        </TouchableOpacity>
    )
}

/* Component styles */
const styles = StyleSheet.create({
    eventCardContainer:{
        width: '90%',
        minWidth: 350,
        height: 350,
        borderWidth: 3,
        borderRadius: 10,
        alignSelf: 'center',
        flexDirection: 'column',
        zIndex: 1
    },
    bannerContainer:{
        width: '100%',
        height: '52.5%',
        borderBottomColor: GatsbyStyles.gatsbyColours.black,
        borderBottomWidth: 2
    },
    infoContainer:{
        width: '100%',
        height: 'auto',
    }
})
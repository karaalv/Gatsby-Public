/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Animated,
    ActivityIndicator 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import BackNavigationButton from "../components/backNavigationButton";
import UserAccountDetails from "../components/userAccountDetails";

/* Import Page Types */
import { EventPageProps } from "../types/PageComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* UI Callback Functions */
import { renderLoadingError } from "../scripts/FrontendFunctions";

/* Import Firebase Services */
import { addAccountToEventAttendees, pullAccountInfo, pullEvent, purchaseTicket } from "../scripts/GatsbyFirestoreFunctions";
import { useAuthContext } from "../utilities/sessionProvider";

/**
 * This component is used to render event pages
 * which details information about each event.
 * 
 * This page acts as the entry point for users 
 * to purchase tickets on the platform. 
 * @returns Event page
 */
export default function EventPageComponent({eventID, createdBy, organiserRoute, accountScope}:EventPageProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Margin for content.
    const detailsMargin = '7%';

    // State management for scrollView.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Animation management for organiser link.
    const translateX = useRef(new Animated.Value(0)).current;

    // Ticket purchase error.
    const [purchaseError, setPurchaseError] = useState(false);

    useEffect(()=>{
        Animated.loop(
            Animated.sequence(
                [
                    Animated.timing(translateX, {
                        toValue: 20,
                        duration: 1500,
                        useNativeDriver: true
                    }),
                    Animated.timing(translateX, {
                        toValue: 20,
                        duration: 100,
                        useNativeDriver: true
                    }
                    ),
                    Animated.timing(translateX, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true
                    })
                ]
            )
        ).start()
    }, [translateX])

    /* FIRESTORE */

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Organiser information.
    const [organiserName, setOrganiserName] = useState(null);
    const [organiserLogoURL, setOrganiserLogoURL] = useState(null);

    // Event information.
    const [eventName, setEventName] = useState(null);
    const [eventCity, setEventCity] = useState(null);
    const [eventCountry, setEventCountry] = useState(null);
    const [eventDescription, setEventDescription] = useState(null);
    const [eventDate, setEventDate] = useState(null);
    const [ticketPrice, setTicketPrice] = useState(null);
    const [eventBanner, setEventBanner] = useState(null);
    const [currencyCode, setCurrencyCode] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState(null);
    const [attendees, setAttendees] = useState<string[] | null>(null);

    // Ticket purchase information.
    const [isPurchasing, setIsPurchasing] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);

    // Fetch data.
    useEffect(() => {
        const fetch = async() => {
            const eventData = await pullEvent({eventIDArg: eventID});
            const organiserData = await pullAccountInfo({accountID: createdBy, context: 'organiser'});

            // Check for loading error.
            if(eventData === null || organiserData === null){
                setLoadingError(true);
            } else {
                // Organiser.
                setOrganiserName(organiserData.username);
                setOrganiserLogoURL(organiserData.organiserLogo);

                // Event.
                setEventName(eventData.eventName);
                setEventCity(eventData.eventCity);
                setEventCountry(eventData.eventCountry);
                setEventDescription(eventData.eventDescription);
                setEventDate(eventData.eventDate);
                setTicketPrice(eventData.ticketPrice);
                setEventBanner(eventData.eventBanner);
                setCurrencySymbol('£');                
                setAttendees(eventData.attendees);

                if(eventData.attendees.includes(user.uid)){
                    setIsPurchased(true);
                } else {
                    setIsPurchased(false);
                }
                
                setIsPurchasing(false);
            }
            setIsLoading(false);
        }
        fetch();
    }, [])

    // Attendee profiles.
    const renderAttendee = (accountID: string) => {
        return(
            <View key={accountID}>
                <UserAccountDetails
                    accountID={accountID}
                />
            </View>
        )
    }

    const networkError = () => {
        return(
            <View style={{
                flexDirection: 'row', 
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
                    fontSize: 20, 
                    fontWeight: '700',
                    color: GatsbyStyles.gatsbyColours.red,
                    marginLeft: '10%'
                }}>
                    Network error 
                </Text>
            </View>
        )
    }

    /* TICKET PURCHASE */
    const purchaseTicketCallback = async () => {
        // Initialise ticket purchasing protocol.
        setIsPurchasing(true);

        const result = await purchaseTicket({accountID: user.uid, eventID: eventID, organiserID: createdBy});

        if(result){
            // Add user to attendees.
            await addAccountToEventAttendees({accountID: user.uid, eventID: eventID, organiserID: createdBy});

            // Navigate to ticket wallet.
            router.replace('(app)/user/(ticketWallet)/ticketWallet');
        } else {
            // Raise ticket purchase error.
            console.log('Error in purchasing ticket')
            setIsPurchasing(false);
            setPurchaseError(true);
        }
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         * 
         * Remove top and bottom insets for content
         * wrapping.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1,
            }}>

            {/* Screen content */}
            {/* Back Button */}
            <View style={{position: 'absolute', top: '7.5%', left: '0%', zIndex: 3, opacity: isScrolling? 0.3:1}}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {isLoading?
                // Loading state.
                <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
            :
                loadingError?
                    renderLoadingError()
                :
                // Event page.
                <View style={{width: '100%', height: '100%'}}>
                    {/* Hero section */}
                    <View style={styles.heroContainer}>

                        {/* Event banner */}
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{uri: eventBanner}}
                                style={{width: '100%', height: '100%', objectFit: 'contain'}}
                            />
                        </View>

                    </View>

                    {/* Event details */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollViewContainer}
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{marginTop: '60%', paddingBottom: '75%'}}
                        onMomentumScrollBegin={() => setIsScrolling(true)}
                        onScroll={(event) => {
                        }}
                        scrollEventThrottle={50}>
                        
                        {/* Wrapper for scrollable content */}
                        <View style={styles.scrollContentContainer}>

                            {/* Container for event details */}
                            <View style={styles.eventDetailsContainer}>

                                {/* Event name */}
                                <View style={{height: 'auto', marginBottom: '3%', marginTop: '3%'}}>
                                    <Text style={[GatsbyStyles.textStyles.profileSection, {padding: 5, flexWrap: 'wrap'}]}>
                                        {eventName}
                                    </Text>
                                </View>

                                {/* Location */}
                                <View style={{height: 'auto', flexDirection: 'row', marginBottom: detailsMargin}}>
                                    {/* Location Icon */}
                                    <Image
                                        source={require('../assets/Utilities/LocationIcon.png')}
                                        style={{
                                            height: 25, 
                                            width: 25, 
                                            objectFit: 'contain', 
                                            alignSelf: 'center',
                                            marginRight: 10
                                        }}
                                    />
                                    <Text style={{fontSize: 22, flexWrap: 'wrap'}}>
                                        {`${eventCity}, ${eventCountry}`}
                                    </Text>
                                </View>

                                {/* Event date */}
                                <View style={{marginBottom: detailsMargin}}>
                                    <Text style={{fontSize: 20, flexWrap: 'wrap'}}>
                                        {eventDate}
                                    </Text>
                                </View>
                                
                                {/* Event description */}
                                <View style={{marginBottom: detailsMargin}}>
                                    <Text style={{fontSize: 18, flexWrap: 'wrap', fontStyle: 'italic'}}>
                                        {eventDescription}
                                    </Text>
                                </View>

                                {/* Organiser link */}
                                <View style={{marginTop: '5%'}}>
                                    <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                                        Organiser
                                    </Text>
                                    <TouchableOpacity style={{
                                        marginTop: 25, 
                                        flexDirection: 'row', 
                                        alignItems: 'center'}}
                                        activeOpacity={0.4}
                                        onPress={organiserRoute}>
                                        <Image
                                            source={{uri: organiserLogoURL}}
                                            style={{
                                                width: 50, 
                                                height: 50, 
                                                objectFit: 'contain',                             
                                                borderWidth: 4,
                                                borderRadius: 10,
                                            }}
                                        />
                                        <Text style={{fontSize: 22, flexWrap: 'wrap', marginLeft: '3%'}}>
                                            {organiserName}
                                        </Text>
                                        <Animated.View style={{transform: [{translateX}]}}>
                                            <Image
                                                source={require('../assets/Utilities/ForwardNavigationArrow.png')}
                                                style={{width: 15, height: 30, objectFit: 'contain', marginLeft: 15}}
                                            />
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>

                                {/* People attending */}
                                {attendees && attendees.length > 0?
                                    <View style={{marginTop: '10%'}}>
                                        <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                                            People
                                        </Text>
                                        {attendees.map((item) => renderAttendee(item))}
                                    </View>
                                :
                                    <></>
                                }

                            </View>

                        </View>

                    </ScrollView>

                    {/* Error */}
                    {purchaseError?
                        <View style={styles.errorText}>
                           {networkError()}
                        </View>                    
                    :
                        <></>
                    }
                    {/* Buy ticket button - Only for user accounts. */}
                    {accountScope == 'user'? 
                        <TouchableOpacity 
                            style={[styles.buyTicketButton, purchaseError? styles.purchaseError : {}, {opacity: isPurchased? 0.5 : 1}]} 
                            activeOpacity={0.7} 
                            onPress={!isPurchased && !isPurchasing? purchaseTicketCallback: ()=>{}}>
                                {isPurchasing? 
                                    <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                                :
                                    <Text style={{
                                        color: GatsbyStyles.gatsbyColours.white, 
                                        fontSize: 20, 
                                        fontWeight: 'bold', 
                                        alignSelf: 'center'
                                    }}>
                                        {isPurchased? `Ticket Purchased`: `Buy Ticket: ${currencySymbol} ${ticketPrice}`}
                                    </Text>
                                }
                        </TouchableOpacity>
                    :
                        <></>
                    }
                </View>
            }
        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    heroContainer: {
        width: '100%',
        height: '50%',
        top: '0%',
        alignSelf: 'center',
        zIndex: 1
    },
    bannerContainer: {
        width: '100%',
        height: '100%',
    },
    eventDetailsContainer: {
        width: '95%',
        alignSelf: 'center',
        padding: '2%',
    },
    scrollViewContainer: {
        zIndex: 2, 
        height: '100%', 
        width: '100%', 
        position: 'absolute', 
        top: '0%',
    },
    scrollContentContainer: {
        width: '100%',
        backgroundColor: GatsbyStyles.gatsbyColours.white, 
        borderRadius: 15,
        alignSelf: 'center'
    },
    buyTicketButton: {
        width: '75%',
        height: 50,
        borderRadius: 50,
        position: 'absolute',
        bottom: '2.5%',
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        alignSelf: 'center',
        justifyContent: 'center',
        zIndex: 3
    },
    errorText: {
        position: 'absolute',
        bottom: '10%',
        zIndex: 3,
        alignSelf: 'center'
    },
    purchaseError:{
        borderWidth: 2.5, 
        borderColor: GatsbyStyles.gatsbyColours.red,    
    },
})
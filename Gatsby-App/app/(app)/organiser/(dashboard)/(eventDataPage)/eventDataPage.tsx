/* Import utilities. */
import { 
    View, Text, StyleSheet, 
    TouchableOpacity, ScrollView,
    ActivityIndicator  
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../../../../utilities/sessionProvider";

/* Import Custom Components */
import BackNavigationButton from "../../../../../components/backNavigationButton";
import UserAccountDetails from "../../../../../components/userAccountDetails";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { pullEventData } from "../../../../../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderLoadingError } from "../../../../../scripts/FrontendFunctions";

/**
 * Event page including analytics and 
 * ticket validation call to action.
 *  
 * @returns Event data page
 */
export default function EventDataPage(){
    // Fetch organiser details.
    const { user } = useAuthContext();

    // Obtain event id from hook.
    const { eventID } = useLocalSearchParams();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Margin for content.
    const detailsMargin = '7%';

    // State management for scrollView.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    /* FIRESTORE */

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Event information.
    const [eventName, setEventName] = useState(null);
    const [eventCity, setEventCity] = useState(null);
    const [eventCountry, setEventCountry] = useState(null);
    const [eventDescription, setEventDescription] = useState(null);
    const [eventDate, setEventDate] = useState(null);
    const [ticketPrice, setTicketPrice] = useState(null);
    const [ticketsSold, setTicketsSold] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [eventBanner, setEventBanner] = useState(null);
    const [currencyCode, setCurrencyCode] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState(null);
    const [attendees, setAttendees] = useState<string[] | null>(null);

    // Fetch data.
    useEffect(() => {
        const fetch = async() => {
            const eventData = await pullEventData({eventIDArg: `${eventID}`, accountID: user.uid});

            // Check loading error.
            if(eventData === null){
                setLoadingError(true);
            } else {
                // Event.
                setEventName(eventData.eventName);
                setEventCity(eventData.eventCity);
                setEventCountry(eventData.eventCountry);
                setEventDescription(eventData.eventDescription);
                setEventDate(eventData.eventDate);
                setTicketPrice(eventData.ticketPrice);
                setTicketsSold(eventData.ticketsSold);
                setRevenue(eventData.revenue);
                setEventBanner(eventData.eventBanner);
                setCurrencySymbol('£');                
                setAttendees(eventData.attendees);
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

    // Route to validation screen.
    const routeToValidation = () => {
        router.push({
            pathname: '(app)/organiser/(dashboard)/(ticketValidation)/ticketValidation',
            params: {eventID: eventID}
        })
    }

    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1
        }}>

            {/* Back Button */}
            <View style={{position: 'absolute', top: '7.5%', left: '0%', zIndex: 3, opacity: isScrolling? 0.3:1}}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {
                isLoading?
                    loading()
                :
                    loadingError?
                        renderLoadingError()
                    :
                        // Event data page.
                        <View style={{width: '100%', height:'100%'}}>
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
                                onMomentumScrollBegin={() => setIsScrolling(true)}>

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
                                                source={require('../../../../../assets/Utilities/LocationIcon.png')}
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

                                        {/* Event analytics */}
                                        <View style={{marginTop: '5%'}}>
                                            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: '5%'}}>
                                                Analytics
                                            </Text>
                                            
                                            {/* Ticket price */}
                                            <View style={styles.metricContainer}>
                                                <Text style={styles.analyticsTitle}>
                                                    Ticket Price:
                                                </Text>
                                                <Text style={styles.analyticsValue}>
                                                    {`${currencySymbol} ${ticketPrice}`}
                                                </Text>
                                            </View>

                                            {/* Tickets sold */}
                                            <View style={styles.metricContainer}>
                                                <Text style={styles.analyticsTitle}>
                                                    Tickets Sold:
                                                </Text>
                                                <Text style={styles.analyticsValue}>
                                                    {ticketsSold}
                                                </Text>
                                            </View>

                                            {/* Revenue */}
                                            <View style={styles.metricContainer}>
                                                <Text style={styles.analyticsTitle}>
                                                    Revenue:
                                                </Text>
                                                <Text style={styles.analyticsValue}>
                                                    {`${currencySymbol} ${revenue}`}
                                                </Text>
                                            </View>

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

                            {/* Validate ticket */}
                            <TouchableOpacity 
                                style={styles.validateTicketButton} 
                                activeOpacity={0.7} 
                                onPress={routeToValidation}>
                                <Text style={{
                                        color: GatsbyStyles.gatsbyColours.white, 
                                        fontSize: 20, 
                                        fontWeight: 'bold', 
                                        alignSelf: 'center'
                                    }}>
                                    Validate Tickets
                                </Text>
                            </TouchableOpacity>
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
    metricContainer: {
        height: 'auto',
        width: '90%',
        margin: '5%',
        flexDirection: 'row'
    },
    analyticsTitle: {
        fontSize: 22, 
        fontWeight: '600',
        color: GatsbyStyles.gatsbyColours.black
    },
    analyticsValue: {
        fontSize: 22,
        fontWeight: '700',
        marginLeft: '5%',
        flexWrap: 'wrap',
        width: '60%',
        height: 'auto',
        color: GatsbyStyles.gatsbyColours.gold,
    },
    validateTicketButton: {
        width: '75%',
        height: 50,
        borderRadius: 50,
        position: 'absolute',
        bottom: '2.5%',
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        alignSelf: 'center',
        justifyContent: 'center',
        zIndex: 3
    }
})
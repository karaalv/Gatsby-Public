/* Import utilities. */
import { 
    View, 
    Modal,
    Text, 
    StyleSheet,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
    Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Image } from 'expo-image';

/* Import Custom Components */
import BackNavigationButton from '../../../../../components/backNavigationButton';
import TicketInfoModal from '../../../../../components/ticketInfoModal';

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { 
    createValidationRequest, 
    pullAccountInfo, 
    pullEvent, 
    pullTicket, 
    removeValidationRequest 
} from '../../../../../scripts/GatsbyFirestoreFunctions';
import { useAuthContext } from '../../../../../utilities/sessionProvider';
import { DocumentReference, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../../../firebaseConfig';
import { renderLoadingError } from '../../../../../scripts/FrontendFunctions';

/**
 * Ticket Information for User account.
 * scanning the ticket on this page 
 * initiate validation protocol.
 * @returns Ticket Info page
 */
export default function TicketInfo(){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Local search parameters hook for ticket data.
    const { eventID, ticketID, organiserID } = useLocalSearchParams();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    /* FIRESTORE */
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [organiserLogoURL, setOrganiserLogoURL] = useState(null);

    const [ticketCid, setTicketCid] = useState(null);
    const [ticketTX, setTicketTX] = useState(null);

    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    // Validation state.
    const [validationState, setValidationState] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    // Ticket modal state.
    const [modalActive, setModalActive] = useState(false);
    const deactivateModal = () => {
        setModalActive(false);
    }
    // Fetch data.
    useEffect(() => {
        const fetch = async () => {
            const eventData = await pullEvent({eventIDArg: `${eventID}`});
            const organiserData = await pullAccountInfo({accountID: `${organiserID}`, context: 'organiser'});
            const ticketData = await pullTicket({userID: user.uid, ticketIDArg: `${ticketID}`});

            // Check for loading error.
            if(eventData === null || organiserData === null || ticketData === null){
                setLoadingError(true);
            } else {
                // Set event data.
                setEventName(eventData.eventName);
                setEventDate(eventData.eventDate);
                // Set organiser data.
                setOrganiserLogoURL(organiserData.organiserLogo);
                // Ticket data.
                setTicketCid(ticketData.cid);
                setTicketTX(ticketData.txReceipt);
                setValidationState(ticketData.validation);
            }
            setIsLoading(false);
        }
        fetch();
    }, [])

    // Subscription for validation.
    useEffect(() => {
        const ticketRef = doc(
            FIRESTORE_DB,
            'UserAccounts', 
            `user_${user.uid}`, 
            'ticketsSubCollection',
            `ticket_${ticketID}`
        )

        const unsubscribeToTicketValidation = onSnapshot(
            // Document reference.
            ticketRef,
            // Snapshot callback. 
            (docSnap) => {
                const {validation} = docSnap.data();
                setValidationState(validation);
                setIsValidating(false);
                setTicketTranslation(0);
            },
            // Snapshot error callback.
            () => {
                setLoadingError(true);
            }
        )

        return () => {
            unsubscribeToTicketValidation();
        }

    }, [])

    /* ANIMATION */

    // Translation.
    const translation = useRef(new Animated.Value(0)).current;
    const [ticketTranslation, setTicketTranslation] = useState(0);
    useEffect(() => {
        Animated.timing(translation, {
            toValue: - ticketTranslation,
            duration: 200, 
            useNativeDriver: true
        }).start()
    }, [ticketTranslation])

    // Pulse.
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if(isValidating){
            Animated.loop(
                Animated.sequence(
                    [
                        Animated.timing(pulse, {
                            toValue: 1.2,
                            duration: 1200,
                            useNativeDriver: true
                        }),
                        Animated.timing(pulse, {
                            toValue: 1,
                            duration: 1200,
                            useNativeDriver: true
                        }),
                    ]
                )
            ).start()
        } else {
            Animated.timing(pulse, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start()
        }

    }, [isValidating])
    
    /* CALLBACKS */

    // Validation request controller.
    const handleValidationRequest = async () => {
        let response: boolean | null;
        if(isValidating){
            response = await removeValidationRequest({
                userID: user.uid,
                eventID: `${eventID}`
            })
            setIsValidating(false);
            setTicketTranslation(0);
        } else {
            response = await createValidationRequest({
                userID: user.uid, 
                eventID: `${eventID}`,
                cid: ticketCid,
                txReceipt: ticketTX,
                ticketID: `${ticketID}` 
            })
            setIsValidating(true);
            setTicketTranslation(50);
        }

        // Check for network error.
        if(response === null){
            setLoadingError(true);
        }
    }

    /* RENDER CALLBACKS */

    const validatedText = () => {
        return(
            <View style={{
                position: 'absolute', 
                bottom: '5%',
                alignSelf: 'center'
                }}>
                <Text style={[
                    styles.validatedText,
                    {
                        color: validationState === 'validated'?
                            GatsbyStyles.gatsbyColours.gold
                        :
                            GatsbyStyles.gatsbyColours.red
                    }
                    ]}>
                    {validationState === 'validated'? 'VALIDATED' : 'INVALID TICKET'}
                </Text>
            </View>
        )
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

            {/* Screen Content */}
                
            {/* Back Button */}
            <View style={[styles.backLinkContainer, {opacity: 1}]}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
                <View>

                </View>
            </View>

            {/* Ticket Options */}
            <TouchableOpacity style={styles.ticketOptionsContainer} activeOpacity={0.2} onPress={() => setModalActive(true)}>
                <Image
                    source={require('../../../../../assets/Utilities/EllipseIcon.png')}
                    style={{
                        height: 35,
                        width: 15,
                        objectFit: 'contain'
                    }}
                />
            </TouchableOpacity>

            {/* Ticket Modal */}
            <Modal
                visible={modalActive}
                transparent={true}
                animationType='fade'
                onRequestClose={() => {
                    setModalActive(!modalActive)
                }}
            >
                <View style={styles.ticketModalWrapper}>
                    <TicketInfoModal modalStateHook={deactivateModal}/>
                </View>
            </Modal>


            {/* Ticket */}
            {
                isLoading?
                    loading()
                :
                    loadingError?
                        renderLoadingError()
                    :
                        // Ticket Info card.
                        <View style={{width: '100%', height: '100%'}}>
                            <Animated.View style={[
                                styles.ticketInfoContainer,
                                {
                                    transform: [{translateY: translation}]
                                }
                                ]}>
                                <View style={[
                                    styles.ticketInfoCard,
                                    {
                                        borderColor: validationState === 'validated'?
                                            GatsbyStyles.gatsbyColours.gold
                                        :
                                            validationState === 'fraudulent'?
                                                GatsbyStyles.gatsbyColours.red
                                            :
                                                GatsbyStyles.gatsbyColours.black
                                    }
                                    ]}>
                                    {/* Event name */}
                                    <Text style={[
                                        styles.eventNameText,
                                        {
                                            color: validationState === 'validated'?
                                            GatsbyStyles.gatsbyColours.gold
                                        :
                                            validationState === 'fraudulent'?
                                                GatsbyStyles.gatsbyColours.red
                                            :
                                                GatsbyStyles.gatsbyColours.black
                                        }]}>
                                        {eventName}
                                    </Text>

                                    {/* Event date */}
                                    <Text style={[
                                        styles.eventDateText,
                                        {
                                            color: validationState === 'validated'?
                                            GatsbyStyles.gatsbyColours.gold
                                        :
                                            validationState === 'fraudulent'?
                                                GatsbyStyles.gatsbyColours.red
                                            :
                                                GatsbyStyles.gatsbyColours.grey                      
                                        }]}>
                                        {eventDate}
                                    </Text>

                                    {/* Organiser logo */}
                                    <View style={{
                                            marginTop: '5%', 
                                            alignSelf: 'flex-start'
                                        }}>
                                        <Image
                                            source={{uri: organiserLogoURL}}
                                            style={{
                                                width: 50, 
                                                height: 50,
                                                borderRadius: 10, 
                                                objectFit: 'contain',
                                                margin: '5%',
                                            }}
                                        />
                                    </View>

                                    {/* Validation confirmation */}
                                    {validationState !== null?
                                        validatedText()
                                    :
                                        <></>
                                    }

                                </View>

                                {/* Pulse */}
                                <Animated.View style={[
                                    styles.pulseContainer,
                                    {
                                        transform: [{scale: pulse}]
                                    }
                                    ]}>
                                    {/* Empty */}
                                </Animated.View>
                            </Animated.View>

                            {/* Request validation button */}
                            <TouchableOpacity 
                                style={[
                                    styles.requestValidateContainer,
                                    {
                                        opacity: isValidating || validationState !== null? 0.4 : 1
                                    }
                                ]} 
                                onPress={validationState !== null || isLoading === true ? 
                                    ()=>{} 
                                : 
                                    handleValidationRequest
                                }
                                activeOpacity={0.6}>
                                {isLoading?
                                    <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                                :
                                    <Text style={styles.requestValidateText}>
                                        {isValidating? `Cancel request` : `Request validation`}
                                    </Text>                                        
                                }
                            </TouchableOpacity>
                        </View>
            }

        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    eventNameText:{
        fontSize: 32,
        flexWrap: 'wrap',
        fontWeight: '700',
        marginBottom: '3%'
    },
    eventDateText:{
        fontSize: 28,
        fontWeight: '600',
    },
    backLinkContainer: {
        position: 'absolute', 
        top: '7.5%', 
        left: '0%', 
        zIndex: 3,
    },
    ticketOptionsContainer:{
        position: 'absolute',
        top: '9%', 
        right: '0%',
        marginRight: '2.5%',
        alignSelf: 'flex-end',
        height: 'auto',
        width: 'auto',
        zIndex: 3,
    },
    ticketModalWrapper:{
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center'
    },
    ticketInfoContainer:{
        top: '15%',
        width: '100%',
        height: '75%',
        position: 'absolute',
    },
    ticketInfoCard:{
        height: '72.5%',
        alignSelf: 'center',
        flexDirection: 'column',
        width: '80%',
        borderWidth: 3,
        borderRadius: 30,
        padding: '5%',
        marginTop: '10%',
        backgroundColor: GatsbyStyles.gatsbyColours.white,
        zIndex: 2
    },
    pulseContainer:{
        position: 'absolute',
        padding: '5%',
        marginTop: '10%',
        alignSelf: 'center',
        width: '80%',
        height: '70%',
        opacity: 0.6,
        borderRadius: 30,
        backgroundColor: GatsbyStyles.gatsbyColours.grey
    },
    requestValidateContainer:{
        width: '75%',
        height: 50,
        borderRadius: 50,
        position: 'absolute',
        bottom: '2.5%',
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    requestValidateText:{
        color: GatsbyStyles.gatsbyColours.white, 
        fontSize: 20, 
        fontWeight: 'bold', 
    },
    validatedText:{
        fontSize: 24,
        fontWeight: '700',
    }
})
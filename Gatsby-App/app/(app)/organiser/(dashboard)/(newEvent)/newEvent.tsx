/* Import utilities. */
import { 
    View, StyleSheet, TouchableOpacity, 
    ScrollView, Text, Animated,
    TextInput, Keyboard, Platform,
    ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Asset } from 'expo-asset';
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from 'expo-image-picker';

/* Import Custom Components */
import BackNavigationButton from "../../../../../components/backNavigationButton";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../../styles/gatsbyStyles';

/* Import Firebase Functions */
import { 
    ref, getDownloadURL, uploadBytesResumable 
} from "firebase/storage";
import { 
    doc, updateDoc, DocumentReference, 
} from "firebase/firestore";
import { FIRESTORE_DB, FIRESTORE_STORAGE } from "../../../../../firebaseConfig";
import { useAuthContext } from "../../../../../utilities/sessionProvider";

/* Import Firebase Functions */
import { pushNewEvent } from "../../../../../scripts/GatsbyFirestoreFunctions";
import { renderLoadingError } from "../../../../../scripts/FrontendFunctions";

// Callback used to push image to storage.
async function uploadImage({imageURI, uid, eventID}) {
    try{
        // Define upload path.
        const storageRef = ref(
            FIRESTORE_STORAGE, 
            `Events/event_${eventID}/EventBanner.jpg`
        );

        // Fetch image blob.
        const response = await fetch(imageURI);
        const blob = await response.blob();

        // Set image metadata.
        const metaData = {
            contentType: 'image/jpeg',
        }

        uploadBytesResumable(storageRef, blob, metaData)
            .then(() => {
                getDownloadURL(storageRef)
                    .then(async (url)=> {
                        // Update url links.
                        const eventSubCollRef = doc(
                            FIRESTORE_DB, 
                            'OrganiserAccounts', 
                            `organiser_${uid}`, 
                            'eventsSubCollection', 
                            `event_${eventID}`
                        );

                        const eventDB = doc(
                            FIRESTORE_DB, 
                            'EventsDB', 
                            `event_${eventID}`
                        );

                        await updateDoc(eventSubCollRef, {
                            eventBanner: url
                        })
                        await updateDoc(eventDB, {
                            eventBanner: url
                        })
                    })
            })

    } catch (error) {
        console.log(`Error uploading user image: ${error}`);
    }
}

/**
 * This page allows organiser accounts to create
 * new events on the platform.
 * 
 * @returns New event page
 */
export default function NewEvent(){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Scroll state management.
    const [isScrolling, setIsScrolling] = useState(false);

    // State management for input fields.
    const [eventName, setEventName] = useState<string>('');
    const [eventNameFieldError, setEventNameFieldError] = useState<boolean>(false);
    const [eventNameErrorMessage, setEventNameErrorMessage] = useState<string>('Please provide an event name');

    const [eventLocation, setEventLocation] = useState<string>('');
    const [eventLocationFieldError, setEventLocationFieldError] = useState<boolean>(false);
    const [eventLocationErrorMessage, setEventLocationErrorMessage] = useState<string>('Please provide an event location');

    const [eventDate, setEventDate] = useState<string>('');
    const [eventDateFieldError, setEventDateFieldError] = useState<boolean>(false);
    const [eventDateErrorMessage, setEventDateErrorMessage] = useState<string>('Please provide an event date');

    const [eventDescription, setEventDescription] = useState<string>('');
    const [eventDescriptionFieldError, setEventDescriptionFieldError] = useState<boolean>(false);
    const [eventDescriptionErrorMessage, setEventDescriptionErrorMessage] = useState<string>('Please provide an event description');

    const [ticketPrice, setTicketPrice] = useState<string>('');
    const [ticketPriceNum, setTicketPriceNum] = useState<number| null>(null);
    const [ticketPriceFieldError, setTicketPriceFieldError] = useState<boolean>(false);
    const [ticketPriceErrorMessage, setTicketPriceErrorMessage] = useState<string>('Please set a ticket price');

    const [currencyCode, setCurrencyCode] = useState<string>('GBP');

    // Media state.
    const [containsBanner, setContainsBanner] = useState(false);
    const [selectedPhoto, setPhoto] = useState<string|null>(null);

    const defaultEventBannerSource = require('../../../../../assets/Utilities/DefaultImage_Medium.png');
    const[defaultEventBannerURI, setDefaultEventBannerURI] = useState (null);

    // Fetch default banner image URI.
    useEffect(() => {
        const loadURI = async () => {
            const resolvedAsset = Asset.fromModule(defaultEventBannerSource);
            await resolvedAsset.downloadAsync();
            const uri = resolvedAsset.localUri || resolvedAsset.uri;
            setDefaultEventBannerURI(uri);
        }
        loadURI();
    }, [defaultEventBannerURI])

    /**
     * Select media from device callback.
     */
    const selectMedia = async () => {
        let media = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        })
        if(media.assets){
            setContainsBanner(true);
            setPhoto(media.assets[0].uri);
        }
    }

    /**
     * Deselect media from device callback.
     */
    const deselectMedia = async () => {
        if(selectedPhoto != null){
            setContainsBanner(false);
            setPhoto(null);
        }
    }

    // State management for height offset.
    const [heightOffset, setHeightOffset] = useState(0);
    const translateY = useRef(new Animated.Value(0)).current;

    // Offset animation.
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: - heightOffset,
            duration: 300,
            useNativeDriver: true
        }).start();

    }, [heightOffset])

    // Keyboard listener.
    Keyboard.addListener('keyboardWillHide', () => {
        setHeightOffset(0);
    })

    // State management for ticket price.
    useEffect(() => {
        if(!ticketPrice){
            setTicketPriceNum(null);
        } else {
            setTicketPriceNum(parseFloat(parseFloat(ticketPrice).toFixed(2)));
        }
    }, [ticketPrice])

    // State management for loading.
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [publishError, setPublishError] = useState<boolean>(false);

    /**
     * Publish event callback.
     */
    const publishEvent = async () => {
        let validInput = true;
        let eventCity: string;
        let eventCountry: string;
        
        // Check values of input fields.
        if(eventName === ''){
            setEventNameFieldError(true);
            setEventNameErrorMessage('Please provide an event name');
            validInput = false;
        } else {
            setEventNameFieldError(false);
        }
        //
        if(eventLocation === ''){
            setEventLocationFieldError(true);
            setEventLocationErrorMessage('Please provide an event location');
            validInput = false;
        } else {

            try{
                // Split location.
                const parts = eventLocation.split(',');
                if(parts.length < 2){
                    throw new Error
                }
                eventCity = parts[0];
                eventCountry = parts[1];                
                setEventLocationFieldError(false);

            } catch (error) {
                setEventLocationFieldError(true);
                setEventLocationErrorMessage('Please use format city, country');
                validInput = false;
            }
        }
        //
        if(eventDate === ''){
            setEventDateFieldError(true);
            setEventDateErrorMessage('Please provide an event date');
            validInput = false;
        } else {
            setEventDateFieldError(false);
        }
        //
        if(eventDescription === ''){
            setEventDescriptionFieldError(true);
            setEventDescriptionErrorMessage('Please provide an event description');
            validInput = false;
        } else {
            setEventDescriptionFieldError(false);
        }
        //
        if(ticketPrice === '' || ticketPrice === null){
            setTicketPriceFieldError(true);
            setTicketPriceErrorMessage('Please set a ticket price');
            validInput = false;
        } else {
            // Convert input to number.
            try{    
                if(isNaN(ticketPriceNum)){
                    throw new Error
                }
                setTicketPriceFieldError(false);
            } catch (error) {
                setTicketPriceFieldError(true);
                setTicketPriceErrorMessage('Ticket price must be a valid number');
                validInput = false;
            }
        }

        // Create firebase document with input fields.
        if(validInput){
            try{
                setIsLoading(true);

                // Push data to firestore.
                const EventID = await pushNewEvent({
                    accountID: user.uid,
                    eventName: eventName,
                    eventDate: eventDate,
                    eventCountry: eventCountry,
                    eventCity: eventCity,
                    eventDescription: eventDescription,
                    ticketPrice: ticketPriceNum,
                    currencyCode: currencyCode
                })

                if(EventID === null){
                    throw new Error("Null event ID");
                }

                // Push image to storage.
                await uploadImage({
                    imageURI: containsBanner? selectedPhoto : defaultEventBannerURI,
                    uid: user.uid,
                    eventID: EventID
                })

                /* NAVIGATE BACK */
                setPublishError(false);
                router.back();

            } catch (error) {
                setIsLoading(false);
                setPublishError(true);
                console.log(`Error creating new event: ${error}`);
            }
        }
    }

    return(
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

            {/* Input fields */}
            <Animated.View style={{transform: Platform.OS === 'ios'? [{translateY}] : []}}>
                <ScrollView 
                    style={{
                        width: '100%',
                        height: '100%'
                    }} 
                    contentContainerStyle={{
                        paddingTop: '25%', 
                        paddingBottom: '10%'
                    }}
                    onScrollBeginDrag={() => setIsScrolling(true)}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='never'>

                    {/* Page title */}
                    <Text style={{
                        margin: '7.5%',
                        marginBottom: '5%',
                        fontSize: 26, 
                        fontWeight: '700'
                    }}>
                        New Event
                    </Text>

                    {/* Event banner */}
                    <View style={[styles.fieldContainer, {marginBottom: '5%'}]}>

                        <Text style={styles.fieldName}>
                            Event Banner:
                        </Text>

                        <TouchableOpacity 
                            style={{
                                width: '100%',
                                height: 'auto'
                            }}
                            activeOpacity={0.4}
                            onPress={selectMedia}>
                            <Image
                                source={
                                    containsBanner? 
                                        {uri: selectedPhoto}
                                    :
                                        {uri: defaultEventBannerURI}
                                }
                                style={{
                                    height: 175, 
                                    width: '90%', 
                                    borderRadius: 10,
                                    borderWidth: 3,
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    margin: '5%'
                                }}
                            />
                            <Image
                                source={require('../../../../../assets/Utilities/EditIcon.png')}
                                style={{
                                    height: 35, 
                                    width: 35, 
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    position: 'absolute',
                                    borderWidth: 2,
                                    borderRadius: 30,
                                    top: '2.5%',
                                    right: '2.5%',
                                    backgroundColor: GatsbyStyles.gatsbyColours.white,
                                    opacity: 0.8
                                }}
                            />
                        </TouchableOpacity>

                        {/* Remove image option */}
                        {containsBanner ?
                            <TouchableOpacity style={{width: 'auto', height: 'auto', alignSelf: 'flex-end'}}
                                onPress={deselectMedia}>
                                <Text style={{
                                    color: GatsbyStyles.gatsbyColours.red,
                                    fontSize: 15,
                                    fontWeight: '600'
                                    }}>
                                    Remove Photo
                                </Text>
                            </TouchableOpacity>
                        :
                            <></>
                        }

                    </View>

                    {/* Event name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldName}>
                            Event Name:
                        </Text>
                        <TextInput
                            style={[styles.textInputBox, eventNameFieldError? styles.inputFieldError : {}]}
                            onFocus={() => setHeightOffset(100)}
                            value={eventName}
                            onChangeText={(input) => setEventName(input)}
                        />
                        {/* Error text */}
                        { eventNameFieldError? 
                            <Text style={styles.errorText}>
                                {eventNameErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Event location */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldName}>
                            Event Location:
                        </Text>
                        <TextInput
                            style={[styles.textInputBox, eventLocationFieldError? styles.inputFieldError : {}]}
                            placeholder='City, Country'
                            onFocus={() => setHeightOffset(250)}
                            value={eventLocation}
                            onChangeText={(input) => setEventLocation(input)}
                        />
                        {/* Error text */}
                        { eventLocationFieldError? 
                            <Text style={styles.errorText}>
                                {eventLocationErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Event date */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldName}>
                            Event Date:
                        </Text>
                        <TextInput
                            style={[styles.textInputBox, eventDateFieldError? styles.inputFieldError : {}]}
                            placeholder='dd mm yyyy'
                            onFocus={() => setHeightOffset(250)}
                            value={eventDate}
                            onChangeText={(input) => setEventDate(input)}
                        />
                        {/* Error text */}
                        { eventDateFieldError? 
                            <Text style={styles.errorText}>
                                {eventDateErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Event description */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldName}>
                            Event Description:
                        </Text>
                        <TextInput
                            style={[
                                styles.textInputBox, 
                                {height: 200, padding: '7.5%'}, 
                                eventDateFieldError? styles.inputFieldError : {}
                            ]}
                            onFocus={() => setHeightOffset(250)}
                            multiline={true}
                            value={eventDescription}
                            onChangeText={(input) => setEventDescription(input)}
                        />
                        {/* Error text */}
                        { eventDescriptionFieldError? 
                            <Text style={styles.errorText}>
                                {eventDescriptionErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Ticket price */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldName}>
                            Ticket Price:
                        </Text>
                        <View 
                            style={[styles.ticketPriceFieldContainer, ticketPriceFieldError? styles.inputFieldError : {}]}
                        >
                            <View style={{
                                width: 50,
                                height: 'auto',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: GatsbyStyles.gatsbyColours.gold
                            }}>
                                <Text style={{
                                    color: GatsbyStyles.gatsbyColours.white,
                                    fontSize: 22,
                                    fontWeight: '800'
                                }}>
                                    £
                                </Text>
                            </View>
                            <TextInput
                                style={{
                                    height: '100%',
                                    width: '80%',
                                    fontSize: 18
                                }}
                                onFocus={() => setHeightOffset(250)}
                                keyboardType='decimal-pad'
                                value={ticketPrice}
                                onChangeText={(input) => {
                                    setTicketPrice(input)
                                }}
                                onEndEditing={() => {
                                    setTicketPrice(parseFloat(ticketPrice).toFixed(2))
                                    setTicketPriceNum(parseFloat(parseFloat(ticketPrice).toFixed(2)));
                                }}
                            />
                        </View>
                        {/* Error text */}
                        { ticketPriceFieldError? 
                            <Text style={styles.errorText}>
                                {ticketPriceErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Post event button */}
                    {/* Error */}
                    {
                        publishError?
                            <View>
                                {renderLoadingError() }                 
                            </View>
                        :
                            <></>
                    }
                    <TouchableOpacity 
                            style={[styles.postEventButton, publishError? styles.inputFieldError : {}]}
                            activeOpacity={0.5}
                            onPress={isLoading? ()=>{} : publishEvent}
                        >
                            {isLoading? 
                                <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                            :
                                <Text style={{
                                    color: GatsbyStyles.gatsbyColours.white,
                                    fontSize: 22,
                                    fontWeight: '800'
                                }}>
                                    Post Event
                                </Text>
                            }
                    </TouchableOpacity>

                </ScrollView>
            </Animated.View>

        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    fieldName:{
        margin: '5%',
        fontSize: 20,
        fontWeight: '600'
    },
    fieldContainer:{
        width: '90%',
        height: 'auto',
        alignSelf: 'center',
        marginBottom: '7.5%'
    },
    textInputBox:{
        height: 50, 
        width: '95%',
        fontSize: 18,
        padding: '3%',
        alignSelf: 'center',
        borderRadius: 25,
        backgroundColor: GatsbyStyles.gatsbyColours.grey
    },
    postEventButton:{
        width: '80%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: '10%',
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        borderRadius: 25
    },
    ticketPriceFieldContainer:{
        height: 50, 
        width: '95%',
        padding: '3%',
        alignSelf: 'center',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: GatsbyStyles.gatsbyColours.grey
    },
    inputFieldError:{
        borderWidth: 2.5, 
        borderColor: GatsbyStyles.gatsbyColours.red,    
    },
    errorText: {
        color: GatsbyStyles.gatsbyColours.red,
        fontSize: 16,
        zIndex: 3,
        fontWeight: '600',
        alignSelf: 'center',
        marginTop: '5%'
    },
})
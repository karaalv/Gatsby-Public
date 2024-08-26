/* Import utilities. */
import { 
    View , 
    StyleSheet, 
    FlatList,
    Text,
    ActivityIndicator
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";

// State hooks.
import { useAuthContext } from "../../../../../utilities/sessionProvider";

/* Import Custom Components */
import BackNavigationButton from "../../../../../components/backNavigationButton";
import ValidationRequestComponent from "../../../../../components/validationRequestComponent";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { onSnapshot, getDocs, collection } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../../../firebaseConfig";
import { ValidationRequest } from "../../../../../types/GatsbyFirestoreTypes";

/* UI Callback Functions */
import { renderLoadingError } from "../../../../../scripts/FrontendFunctions";

/**
 * Returns page used to validate tickets for
 * a given event.
 * 
 * @returns Ticket Validation Page
 */
export default function TicketValidation(){
    // Fetch organiser details.
    const { user } = useAuthContext();

    // Obtain event id from hook.
    const { eventID } = useLocalSearchParams();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    /* FIRESTORE */
    const [validationRequests, setValidationRequests] = useState(null);

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);

    // Subscribe to new validation requests.
    useEffect(() => {
        const validationRequestsRef = collection(
            FIRESTORE_DB,
            'EventsDB',
            `event_${eventID}`,
            'ValidationRequests'
        )

        const unsubscribeToValidationRequests = onSnapshot(
            // Document reference.
            validationRequestsRef,
            // Snapshot callback. 
            (snapShot) => {
                const requests = snapShot.docs.map((document) => {
                    const {
                        userID,
                        cid,
                        txReceipt,
                        ticketID
                    } = document.data();

                    const validationRequest: ValidationRequest = {
                        userID: userID,
                        cid: cid,
                        ticketID: ticketID,
                        txReceipt: txReceipt
                    }

                    return validationRequest;
                })

                setValidationRequests(requests);
            },
            // Snapshot error callback.
            () => {
                setLoadingError(true);
            }
        )

        // Clean up listener.
        return () => {
            unsubscribeToValidationRequests();
        }

    }, [])

    /* RENDER CALLBACKS */
    // Heading.
    const renderHeader = () => {
        return(
            <View>
                <Text style={{
                    marginLeft: '5%',
                    marginBottom: '5%',
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: GatsbyStyles.gatsbyColours.black
                    }}>
                    Validation Requests:
                </Text>
            </View>
        )
    }

    // Validation request.
    const renderRequest = (item: ValidationRequest) => {
        return(
            <View key={item.userID} style={{marginBottom: '7.5%'}}>
                <ValidationRequestComponent
                    userID={item.userID}
                    eventID={`${eventID}`}
                    ticketID={item.ticketID}
                    cid={item.cid}
                    txReceipt={item.txReceipt}
                />
            </View>
        )
    }

    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    return(
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1
        }}>
            {/* Back Button */}
            <View style={{position: 'absolute', top: '7.5%', left: '0%', zIndex: 5}}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {
              
                loadingError?
                    renderLoadingError()
                :
                    // Validation requests.
                    <FlatList
                        // Styles.
                        style={styles.validationFlatList}
                        contentContainerStyle={{paddingBottom: '25%', paddingTop: '35%'}}
                        // Data.
                        data={validationRequests}
                        renderItem={({item}) => renderRequest(item)}
                        // Header.
                        ListHeaderComponent={renderHeader()}
                    />
            }

        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    absolutePosition:{
        position: 'absolute',
        top: '45%',
        alignSelf: 'center'
    },
    validationFlatList:{
        alignSelf: 'center',
        height: '100%',
        width: '100%'
    }
})
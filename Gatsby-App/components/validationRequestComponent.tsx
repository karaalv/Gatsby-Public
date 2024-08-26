/* Import utilities. */
import { 
    View , 
    StyleSheet, 
    Animated,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Text
} from "react-native"
import { Image } from "expo-image";
import { useRef, useEffect, useState } from "react";

/* Import Custom Components */
import UserAccountDetails from "./userAccountDetails";

/* Import Component Types */
import { ValidationRequestComponentProps } from "../types/UiComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIRESTORE_DB } from "../firebaseConfig";
import { removeValidationRequest, validateTicket } from "../scripts/GatsbyFirestoreFunctions";

export default function ValidationRequestComponent({userID, cid, txReceipt, eventID, ticketID}: ValidationRequestComponentProps){

    // Validation state.
    const [validationState, setValidationState] = useState(null);
    const [validationMessage, setValidationMessage] = useState('User not validated')
    const [isValidating, setIsValidating] = useState(false);

    // Validate ticket.
    const validate = async () => {
        setIsValidating(true);
        const response = await validateTicket({
            userID: userID, 
            eventID: eventID, 
            cid: cid, 
            txReceipt: txReceipt, 
            ticketID: ticketID
        })

        // Error from server.
        if(response === null){
            setValidationState('error');
            setValidationMessage('Unable to validate ticket.')
            setIsValidating(false);
            return;
        }

        // Ticket validation state.
        if(response){
            setValidationState('validated');
            setValidationMessage('VALID TICKET');
            setIsValidating(false);
        } else {
            setValidationState('error');
            setValidationMessage('INVALID TICKET');
            setIsValidating(false);
        }
    }

    // Clear validation request.
    const cancel = async () => {
        await removeValidationRequest({userID: userID, eventID: `${eventID}`});
    }

    return(
        <TouchableOpacity style={styles.validationRequest} onPress={validate}>
            {/* Profile section */}
            <View style={{flexDirection: 'column'}}>
                <UserAccountDetails
                    accountID={userID}
                />
                {/* Validation message */}
                <Text style={{
                        fontSize: 18, 
                        fontWeight: '600',
                        marginTop: '5%',
                        color: validationState === 'error'? 
                                GatsbyStyles.gatsbyColours.red 
                            :
                                validationState === 'validated'?
                                    GatsbyStyles.gatsbyColours.green
                                :
                                    GatsbyStyles.gatsbyColours.grey
                    }}>
                    {validationMessage}
                </Text>
            </View>

            <TouchableOpacity onPress={cancel}>
                {isValidating? 
                    <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
                :
                    <Image
                        source={require('../assets/Utilities/CancelSearchIcon.png')}
                        style={{
                            width: 35,
                            height: 35,
                            objectFit: 'contain'
                        }}
                    />  
                }
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

/* Component styles */
const styles = StyleSheet.create({
    validationRequest:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 15
    }
})
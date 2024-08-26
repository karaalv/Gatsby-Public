/* Import utilities. */
import { 
    View,
    Modal,
    ModalProps, 
    Text, 
    StyleSheet,
    Animated,
    TouchableOpacity,
    ActivityIndicator 
} from 'react-native';
import { useState, useEffect, useRef } from 'react';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
type TicketInfoModalProps = {
    modalStateHook: () => void
}

export default function TicketInfoModal({modalStateHook}: TicketInfoModalProps){
    // Modal state management.

    return(
        <View style={styles.modalContainer}>
            <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={modalStateHook}>
                <Text>
                    Close
                </Text>
            </TouchableOpacity>
        </View>
    )
}

/* Component styles */
const styles = StyleSheet.create({
    modalContainer:{
        width: '90%', 
        height: '30%',
        backgroundColor: GatsbyStyles.gatsbyColours.white,
        position: 'absolute',
        top: '30%',
        padding: '5%',
        borderRadius: 30,
        zIndex: 2
    },
})
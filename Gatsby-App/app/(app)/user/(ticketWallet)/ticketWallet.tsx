/* Import utilities. */
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import UserNavbar from '../../../../components/userNavbar';

/* Import Component Types */
import { TicketBoxProps } from "../../../../types/UiComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { useAuthContext } from "../../../../utilities/sessionProvider";
import { pullTickets } from "../../../../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderTicketBox, renderLoadingError } from "../../../../scripts/FrontendFunctions";

/**
 * User Account Ticket Wallet
 * @returns Ticket Wallet
 */
export default function TicketWallet(){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for content.
    const flatListRef = useRef<FlatList | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    /* FIRESTORE */
    
    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    const [tickets, setTickets] = useState<TicketBoxProps[] | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            const data = await pullTickets({accountID: user.uid});

            // Check for loading error.
            if(data === null){
                setLoadingError(false);
            } else {
                setTickets(data);
            }
            setIsLoading(false);
        }
        fetchTickets();
    }, [])

    // Render ticket boxes.
    const renderTickets = () => {
        return(
            <FlatList
                ref={flatListRef}
                data={tickets}
                ListHeaderComponent={pageTitle}
                renderItem={({item}) => renderTicketBox({item: item})}
                contentContainerStyle={{paddingBottom: '25%', paddingTop: '20%', width: '100%'}}
                onScrollBeginDrag={() => setIsScrolling(true)}
                showsVerticalScrollIndicator={false}
            />
        )
    }

    // Page title when user has tickets.
    const pageTitle = () => {
        return(
            <View style={styles.pageTitle}>
                <Text style={{
                    margin: '5%',
                    fontSize: 26, 
                    fontWeight: '500',
                    marginBottom: '10%'
                }}>
                    My Tickets
                </Text>
            </View>
        )
    }

    // Render when user has no purchased tickets.
    const empty = () => {
        return(
            <View style={{marginTop: '20%'}}>
                <Text style={{
                    margin: '7.5%',
                    fontSize: 26, 
                    fontWeight: '500',
                    marginBottom: '10%'
                }}>
                    My Tickets
                </Text>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: GatsbyStyles.gatsbyColours.grey,
                    alignSelf: 'center',
                    marginTop: '10%',
                }}>
                    Empty ticket wallet
                </Text>
            </View>
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

            <View style={styles.flatListContainer}>

                {/* Tickets */}
                {isLoading?
                    <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
                :
                    loadingError?
                        renderLoadingError()
                    :
                        tickets.length > 0? renderTickets() : empty()
                }

            </View>

            {/* Render User Navigation bar */}
            <UserNavbar
                navigationState='ticketWallet'
                isParentScrolling={isScrolling}
            />

        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    pageTitle: {
        left: '7.5%',
    },
    flatListContainer:{
        height: '100%',
    },
})
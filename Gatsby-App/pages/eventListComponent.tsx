/* Import utilities */
import { View, StyleSheet, FlatList, ScrollView, ActivityIndicator, Text } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState, useEffect } from "react";
import { router } from "expo-router";

/* Import Custom Components */
import EventCard from "../components/eventCard";
import BackNavigationButton from "../components/backNavigationButton";

/* Import component types */
import { EventCardItemProps, EventCardProps } from "../types/UiComponentTypes";

/* Import Page Types */
import { EventPageProps, EventListPageProps } from "../types/PageComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIRESTORE_DB } from "../firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import { pullAccountEventCards, pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderEventCard, renderLoadingError } from "../scripts/FrontendFunctions";

/**
 * This page contains a list of all 
 * organiser events.
 * @returns Event list
 */
export default function EventListComponent({rootPath, accountScope, accountID}: EventListPageProps){
    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for scrollView.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    // Configure root path.
    let route: string;

    if(rootPath === 'profile'){
        route = `(app)/organiser/(profile)/(eventPage)/eventPage`
    } else {
        route = `(app)/${accountScope}/(${rootPath})/(organiserProfile)/(eventPage)/eventPage`
    }

    /* FIRESTORE */

    // Account details.
    const [logoPhotoURL, setLogoPhotoURL] = useState(null);
    // Events.
    const [accountEvents, setAccountEvents] = useState<EventCardProps[] | null>(null);

    // Load account data.
    useEffect(() => {
        const fetch = async () => {
            const accountInfo = await pullAccountInfo({accountID: accountID, context:'organiser'});
            const accountEventCards = await pullAccountEventCards({accountID: accountID});

            // Check for loading error.
            if(accountInfo === null || accountEventCards === null){
                setLoadingError(true);
            } else {
                // Set account info.
                setLogoPhotoURL(accountInfo.organiserLogo);
                // Set events.
                setAccountEvents(accountEventCards);
            }
            setIsLoading(false);
        }
        fetch();
    }, [])

    /* RENDERING CALLBACKS */

    // Empty events
    const eventsEmpty = () => {
        return(
            <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: GatsbyStyles.gatsbyColours.grey,
                alignSelf: 'center',
                margin: 10,
            }}>
                No Events
            </Text>
        )
    }

    // Callback to render event card components.
    const events = () => {
        return(
            <View>
                {accountEvents.map((item) => renderEventCard({item: item, routerCallback: () => {
                    router.push({
                        pathname: route,
                        params: {eventID: item.id, createdBy: item.createdBy}
                    })
                }}))}
            </View>
        )
    }

    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    return(
        // Wrap in inset.
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flex: 1
        }}>
            {/* Screen content */}

            {/* Back Link */}
            <View style={[styles.backLinkContainer, {opacity: isScrolling? 0.3:1}]}>
                <BackNavigationButton
                    onPress={() => router.back()}
                />
                {/* Organiser Logo */}
                <Image
                    source={{uri: logoPhotoURL}}
                    style={{
                        width: 40, 
                        height: 40, 
                        objectFit: 'contain',
                        marginRight: '1%',
                        borderWidth: 3,
                        borderRadius: 10,
                    }}
                />
            </View>

            {
                isLoading?
                    loading()
                :
                    loadingError?
                        renderLoadingError()
                    :
                        // Event list
                        <ScrollView
                            ref={scrollViewRef}
                            showsVerticalScrollIndicator={false}
                            style={{alignSelf: 'center', width: '100%'}}
                            contentContainerStyle={{paddingTop: '35%', paddingBottom: '25%'}}
                            onScrollBeginDrag={() => {
                                setIsScrolling(true);
                            }}>

                            {/* Map over events */}
                            {
                                accountEvents.length > 0?
                                    events()
                                : 
                                    eventsEmpty()
                            }

                        </ScrollView>
            }

        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    backLinkContainer: {
        height: 'auto',
        width: 'auto',
        alignItems: 'center',
        position: 'absolute', 
        top: '2.5%', 
        left: '0%',
        flexDirection: 'row',
        zIndex: 1,
    }
})
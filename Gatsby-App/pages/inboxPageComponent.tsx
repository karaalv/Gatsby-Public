/* Import utilities. */
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthContext } from "../utilities/sessionProvider";
import { useAccountTypeContext } from "../utilities/accountTypeProvider";

/* Import Custom Components */
import BackNavigationButton from '../components/backNavigationButton';
import InboxCard from "../components/inboxCard";

/* Import Component Types */
import { InboxCardProps } from "../types/UiComponentTypes";

/* Import Page Types */
import { InboxPageProps } from "../types/PageComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';
import { pullInbox } from "../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderLoadingError } from "../scripts/FrontendFunctions";

/**
 * Inbox page for User Account. Loads 
 * message previews inside of Inbox card
 * component within 'message' context.
 * @returns Inbox page
 */
export default function InboxPageComponent({accountScope}: InboxPageProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Obtain sending account type from hook.
    const accountObservingType = useAccountTypeContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();
    const [isScrolling, setIsScrolling] = useState(false);

    // Inbox data.
    const [inbox, setInbox] = useState<InboxCardProps[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [loadingError, setLoadingError] = useState(false);

    // Fetch inbox.
    useEffect(() => {
        const fetch = async() => {
            const data = await pullInbox({accountID: user.uid, accountType: accountObservingType});
            // Check for loading error.
            if(data === null){
                setLoadingError(true);
            } else {
                setInbox(data)
            }
            setIsLoading(false)
        }
        fetch()
    }, [])

    /* Callback functions */

    // Render Ticket UI callback.
    function renderMessages(item: InboxCardProps){
        return(
            <View style={{marginBottom: '10%', alignSelf: 'center'}} key={item.chatID}>
                <InboxCard
                    isRead={item.isRead}
                    accountID={item.accountID}
                    accountType={item.accountType}
                    chatID={item.chatID}
                    latestMessage={item.latestMessage}
                />
            </View>
        )
    }

    // Text to prompt an empty inbox.
    const empty= () => {
        return(
            <View style={{paddingTop: '20%'}}>
                <View style={{alignSelf: 'flex-end', margin: '5%'}}>
                    <Text style={GatsbyStyles.textStyles.largeText}>
                        Inbox
                    </Text>
                </View>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: GatsbyStyles.gatsbyColours.grey,
                    alignSelf: 'center',
                    marginTop: '50%',
                }}>
                    No messages
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
            flex: 1,
        }}>

            {/* Screen Content */}

            {/* Top of screen  */}
            <View style={[styles.backLinkContainer, {opacity: isScrolling? 0.3:1}]}>
                {/* Back Button */}
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>


            {/* Flat List - Retrieves and displays users messages. */}
            <View style={styles.flatListContainer}>
                {isLoading? 
                    <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
                :
                    loadingError?
                        renderLoadingError()
                    :
                        inbox.length > 0?
                            <FlatList
                                data={inbox}
                                renderItem={({item}) => renderMessages(item)}
                                contentContainerStyle={{paddingBottom: '25%', paddingTop: '20%'}}
                                onScrollBeginDrag={() => setIsScrolling(true)}
                                ListHeaderComponent={() => (
                                    <View style={{alignSelf: 'flex-end', margin: '5%'}}>
                                        <Text style={GatsbyStyles.textStyles.largeText}>Inbox</Text>
                                    </View>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        :
                            empty()
                }

            </View>

        </View>
    )
}

/* Page Styles. */
const styles = StyleSheet.create({
    backLinkContainer: {
        position: 'absolute', 
        top: '7.5%', 
        left: '0%', 
        zIndex: 3,
    },
    flatListContainer:{
        height: '100%',
        width: '100%'
    },
})
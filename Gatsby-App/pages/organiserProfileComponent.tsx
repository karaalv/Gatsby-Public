/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";

/* Import Custom Components */
import PostComponent from "../components/postComponent";
import EventCard from "../components/eventCard";
import FollowButton from "../components/followButton";
import BackNavigationButton from "../components/backNavigationButton";

/* Import Component Types */
import { 
    PostComponentItemProps, PostComponentProps, 
    EventCardItemProps, EventCardProps 
} from "../types/UiComponentTypes";

/* Import Page Types */
import { EventPageProps, OrganiserProfileComponentProps } from "../types/PageComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIRESTORE_DB } from "../firebaseConfig";
import { useAuthContext } from "../utilities/sessionProvider";
import { doc, getDoc } from 'firebase/firestore';
import { pullAccountEventCards, pullAccountPosts, pullAccountInfo } from "../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderPost, renderEventCardHorizontal, renderLoadingError } from "../scripts/FrontendFunctions";

/**
 * Component used to render external organiser
 * profiles.
 * @returns External organiser profile.
 */
export default function OrganiserProfileComponent({accountID, rootPath, accountScope}: OrganiserProfileComponentProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for scrollView.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    /* FIRESTORE */

    // Account details.
    const [username, setUsername] = useState(null);
    const [profilePhotoURL, setProfilePhotoURL] = useState(null);
    const [logoPhotoURL, setLogoPhotoURL] = useState(null);

    // Posts.
    const [accountFeed, setAccountFeed] = useState<PostComponentProps[] | null>(null);
    
    // Events.
    const [accountEvents, setAccountEvents] = useState<EventCardProps[] | null>(null);

    // Load organiser account.
    useEffect(() => {
        const fetch = async () => {
            const accountInfo = await pullAccountInfo({accountID: accountID, context:'organiser'});
            const accountPosts = await pullAccountPosts({accountID: accountID, context: 'organiser'});
            const accountEventCards = await pullAccountEventCards({accountID: accountID});
            
            // Check for loading error.
            if(accountInfo === null || accountPosts === null || accountEventCards === null){
                setLoadingError(true);
            } else {
                // Set account info.
                setUsername(accountInfo.username);
                setProfilePhotoURL(accountInfo.profileImage);
                setLogoPhotoURL(accountInfo.organiserLogo);
                // Set posts.
                setAccountFeed(accountPosts);
                // Set events.
                setAccountEvents(accountEventCards.length > 3? accountEventCards.slice(0, 3) : accountEventCards);
            }
            setIsLoading(false);
        }
        fetch();
    }, [])

    /* RENDERING CALLBACKS */

   // Events.

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

    // Callback to render events in horizontal component.
    const events = () => {
        return(
            <View style={{flexDirection: 'row'}}>
                {/* Event Posts */}
                {accountEvents.map((item) => renderEventCardHorizontal({item: item, routerCallback: () => {
                    router.push({
                        pathname: `(app)/${accountScope}/(${rootPath})/(organiserProfile)/(eventPage)/eventPage`,
                        params: {eventID: item.id, createdBy: accountID}
                    })
                }}))}

                {/* Link */}
                <TouchableOpacity 
                    style={{alignSelf: 'center', alignItems: 'center', flexDirection: 'row', width: '20%'}}
                    onPress={() => router.push({
                        pathname: `(app)/${accountScope}/(${rootPath})/(organiserProfile)/(eventList)/eventList`,
                        params: {accountID: accountID}
                    })}>
                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: 'bold',
                            margin: 5,
                            padding: '3%',
                        }}
                    >
                        See all
                    </Text>
                    <Image
                        source={require('../assets/Utilities/ForwardNavigationArrow.png')}
                        style={{width: 15, height: 30, objectFit: 'contain', marginLeft: 5}}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    // Posts.

    // Callback to render post components.
    const feed = () => {
        return(
            <View style={{marginTop: '5%'}}>
                {accountFeed.map((item) => renderPost({item: item, routerCallback: ()=>{}}))}
            </View>
        )
    }

    // Callback to render on empty account posts.
    const feedEmpty = () => {
        return(
            <Text style={{
                fontSize: 20,
                fontWeight: '500',
                color: GatsbyStyles.gatsbyColours.grey,
                alignSelf: 'center',
                marginTop: '20%',
            }}>
                No Posts
            </Text>
        )
    }

    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    /* FUNCTIONAL CALLBACKS */

    // Message router callback.
    const routeToMessages = () => {
        router.push({
            pathname: `(app)/${accountScope}/(${rootPath})/(message)/message`,
            params: {recipientID: accountID, recipientAccountType: 'organiser'}
        })
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
            flex: 1
        }}>
            {/* Screen content */}

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
                        // Organiser account.
                        <View style={{width: '100%', height:'100%'}}>
                            {/* Hero section */}
                            <View style={styles.heroSectionContainer}>

                                {/* Profile image */}
                                <Image
                                    source={{uri: profilePhotoURL}}
                                    style={{
                                        width: '100%', 
                                        height:'100%', 
                                        objectFit: 'contain'
                                    }}
                                />

                            </View>
                            
                            {/* Organiser profile content */}
                            <ScrollView
                                ref={scrollViewRef} 
                                style={styles.ScrollViewContainer}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{paddingTop: '42.5%', paddingBottom: '25%'}}
                                onScrollBeginDrag={() => {
                                    setIsScrolling(true);
                                }}
                                onScroll={(event) => {
                                }}
                                scrollEventThrottle={50}
                                disableScrollViewPanResponder={true}>


                                {/* Organiser logo and name */}
                                <View style={styles.logoContainer}>

                                    <Image
                                        source={{uri: logoPhotoURL}}
                                        style={{
                                            width: 70, 
                                            height: 70, 
                                            objectFit: 'contain',
                                            marginRight: '2%',
                                            borderWidth: 4,
                                            borderRadius: 10,
                                        }}
                                    />
                                    <Text 
                                        style={{
                                            flexWrap: 'wrap', 
                                            fontSize: 28, 
                                            fontWeight: '800', 
                                            color: GatsbyStyles.gatsbyColours.gold,
                                            alignSelf: 'flex-end',
                                            margin: '1%',
                                            width: '75%'
                                        }}>
                                        {username}
                                    </Text>

                                </View>

                                {/* Organiser profile content (Events and Posts) */}
                                <View style={styles.profileContentContainer}>

                                    {/* Follow and message button */}
                                    <View style={{
                                            margin: '5%', 
                                            marginBottom: '2%', 
                                            marginTop: '6%',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                        {/* Follow */}
                                        <FollowButton
                                            followerID={user.uid}
                                            followingID={accountID}
                                            followerAccountType={accountScope}
                                            followingAccountType='organiser'
                                        />
                                        {/* Message */}
                                        <TouchableOpacity activeOpacity={0.3} onPress={routeToMessages}>
                                            <Image
                                                source={require('../assets/Utilities/InboxIcon.png')}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    objectFit: 'contain',                                    
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Events */}
                                    <Text
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 'bold',
                                            margin: '5%',
                                            padding: '1%'
                                        }}>
                                        Upcoming Events
                                    </Text>

                                    {/* Events carousel */}
                                    <ScrollView
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{paddingRight: '7.5%', paddingLeft: '1%'}}>

                                        {/* Event card*/}
                                        { 
                                            accountEvents.length > 0 ? 
                                                events() 
                                            : 
                                                eventsEmpty()
                                        }
                                    </ScrollView>

                                    {/* Posts */}
                                    <Text
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 'bold',
                                            margin: '5%',
                                            padding: '1%'
                                        }}
                                    >
                                        Posts
                                    </Text>

                                    {/* Feed */}
                                    { 
                                        accountFeed.length > 0 ? 
                                            feed() 
                                        : 
                                            feedEmpty()
                                    }
                                </View>

                            </ScrollView>
                        </View>
            }
    
        </View>
    
    )
}

/* Page styles */
const styles = StyleSheet.create({
    heroSectionContainer:{
        width: '100%',
        height: '30%',
        position: 'absolute',
        top: '0%',
        zIndex: 1
    },
    logoContainer:{
        flexDirection: 'row',
        width: '95%',
        height: 'auto',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'absolute',
        marginTop: '45%',
        paddingBottom: '5%',
        zIndex: 2,
    },
    ScrollViewContainer:{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0%',
        overflow: 'hidden',
        zIndex: 2
    },
    profileContentContainer:{
        backgroundColor: GatsbyStyles.gatsbyColours.white,
        borderRadius: 15,
        marginTop: '10%',
        paddingTop: '12.5%',
        width: '100%',
        height: 'auto'
    }
})
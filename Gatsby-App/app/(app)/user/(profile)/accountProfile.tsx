/* Import utilities. */
import { 
    View, Text, StyleSheet, 
    TouchableOpacity, ScrollView,
    ActivityIndicator 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import PostComponent from "../../../../components/postComponent";
import UserNavbar from "../../../../components/userNavbar";

/* Import Component Types */
import { PostComponentProps } from "../../../../types/UiComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIRESTORE_DB } from "../../../../firebaseConfig";
import { useAuthContext } from "../../../../utilities/sessionProvider";
import { doc, getDoc } from 'firebase/firestore';
import { pullAccountPosts, pullAccountInfo } from "../../../../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderPost, renderLoadingError } from "../../../../scripts/FrontendFunctions";

/**
 * This this page acts as the profile section
 * for the user currently logged in to the 
 * device.
 * 
 * This page also acts as an entry point to
 * the users account settings.
 * @returns User profile.
 */
export default function AccountProfile(){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for feed content.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    /* FIRESTORE */

    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    // Account details.
    const [username, setUsername] = useState(null);
    const [profilePhotoURL, setProfilePhotoURL] = useState(null);

    // Posts.
    const [accountFeed, setAccountFeed] = useState<PostComponentProps[] | null>(null);

    // Load account info.
    useEffect(() => {
        const fetch = async () => {
            const accountInfo = await pullAccountInfo({accountID: user.uid, context:'user'});
            const accountPosts = await pullAccountPosts({accountID: user.uid, context: 'user'});

            // Check for loading error.
            if(accountInfo === null || accountPosts === null){
                setLoadingError(true);
            } else {
                // Set account info.
                setUsername(accountInfo.username);
                setProfilePhotoURL(accountInfo.profileImage);
                // Set posts.
                setAccountFeed(accountPosts);
            }
            setIsLoading(false);
        }
        fetch()
    }, [])

    // Callback to render post components.
    const feed = () => {
        return(
            <View>
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
                marginTop: '30%',
            }}>
                No Posts? Don't be shy !
            </Text>
        )
    }

    // Loading state for account posts.
    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
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
            {/* Screen Content */}

            {
                isLoading?
                    loading()
                :
                    loadingError?
                        renderLoadingError()
                    :
                        // Account profile.
                        <View style={{width: '100%', height: '100%'}}>
                            {/* Hero section - Profile header */}
                            <View style={styles.heroContainer}>

                                {/* Profile Image */}
                                <Image
                                    source={{uri: profilePhotoURL}}
                                    style={{
                                        width: '100%', 
                                        height:'100%', 
                                        objectFit: 'contain'
                                    }}
                                />

                            </View>

                            {/* Profile content */}
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollViewContainer}
                                showsVerticalScrollIndicator={false}
                                onScrollBeginDrag={() => setIsScrolling(true)}
                                contentContainerStyle={{paddingTop: '60%', paddingBottom: '25%'}}>

                                <View style={styles.scrollViewContent}>

                                    {/* Username and settings */}
                                    <View style={{
                                        width: '90%', 
                                        height: 'auto', 
                                        flexDirection: 'row', 
                                        alignSelf: 'center', 
                                        alignItems: 'center', 
                                        }}>

                                        {/* Username */}
                                        <View style={styles.usernameContainer}>

                                            <Text style={[
                                                GatsbyStyles.textStyles.profileSection, 
                                                {
                                                    flexWrap: 'wrap', 
                                                    width: '100%', 
                                                    height: 'auto'
                                                }]}>
                                                {username}
                                            </Text>

                                        </View>

                                        {/* Settings button */}
                                        <TouchableOpacity style={{alignSelf: 'flex-end'}} activeOpacity={0.25} 
                                            onPress={() => router.push('(app)/user/(profile)/(settings)/userSettings')}>
                                            <Text style={{
                                                color: GatsbyStyles.gatsbyColours.gold,
                                                fontSize: 50,
                                                fontWeight: '600',
                                            }}>...</Text>
                                        </TouchableOpacity>

                                    </View>

                                    {/* Posts carousel */}
                                    <View style={{margin: '5%', marginTop: '5%', marginLeft: '5%'}}>
                                        <Text style={{
                                                fontSize: 26, 
                                                fontWeight: '500'
                                            }}>
                                                My Posts
                                            </Text>
                                    </View>
                                    
                                    {/* Posts */}
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

            {/* New post button */}
            <TouchableOpacity style={[styles.newPostButtonContainer, {opacity: isScrolling? 0.3:1}]} activeOpacity={0.7}
                onPress={() => router.push('(app)/user/(profile)/(newPost)/newPost')}>
                <Text style={{fontSize: 20, textAlign: 'center', color: GatsbyStyles.gatsbyColours.white}}>+</Text>
            </TouchableOpacity>

            {/* Render User Navigation bar */}
            <UserNavbar
                navigationState='profile'
                isParentScrolling={isScrolling}
            />

        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    heroContainer:{
        width: '100%',
        height: '30%',
        position: 'absolute',
        top: '0%',
        alignSelf: 'center',
        zIndex: 1,
    },
    usernameContainer:{
        width: '90%',
        height: 'auto',
        padding: '2%',
        flexWrap: 'wrap',
        marginTop: '2%'
    },
    scrollViewContainer:{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        alignSelf: 'center',
        zIndex: 2
    },
    scrollViewContent: {
        backgroundColor: GatsbyStyles.gatsbyColours.white,
        borderRadius: 20
    },
    newPostButtonContainer:{
        position: 'absolute',
        bottom: '12.5%',
        right: '5%',
        zIndex: 2,
        width: 50, 
        height: 50,
        borderRadius: 50,
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
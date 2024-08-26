/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator,
    TouchableOpacity
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";

/* Import Custom Components */
import FollowButton from "../components/followButton";
import BackNavigationButton from "../components/backNavigationButton";

/* Import Component Types */
import { PostComponentProps } from "../types/UiComponentTypes";

/* Import Page Types */
import { UserProfileComponentProps } from "../types/PageComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIRESTORE_DB } from "../firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import { pullAccountInfo, pullAccountPosts } from "../scripts/GatsbyFirestoreFunctions";
import { useAuthContext } from "../utilities/sessionProvider";

/* UI Callback Functions */
import { renderPost, renderLoadingError } from "../scripts/FrontendFunctions";

/**
 * Component used to render external user
 * profiles.
 * @returns External user profile.
 */
export default function UserProfileComponent({accountID, rootPath, accountScope}: UserProfileComponentProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();
    
    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for feed content.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Manage network state.
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);

    /* FIRESTORE */
    
    // Account details.
    const [username, setUsername] = useState(null);
    const [profilePhotoURL, setProfilePhotoURL] = useState(null);

    // Posts.
    const [accountFeed, setAccountFeed] = useState<PostComponentProps[] | null>(null);

    // Load user account.
    useEffect(() => {
        const fetch = async () => {
            const accountInfo = await pullAccountInfo({accountID: accountID, context:'user'});
            const accountPosts = await pullAccountPosts({accountID: accountID, context: 'user'});

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
                No Posts
            </Text>
        )
    }

    // Loading state for account posts.
    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    // Message router callback.
    const routeToMessages = () => {
        router.push({
            pathname: `(app)/${accountScope}/(${rootPath})/(message)/message`,
            params: {recipientID: accountID, recipientAccountType: 'user'}
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
            {/* Screen Content */}

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

                        // User account.
                        <View style={{width: '100%', height: '100%'}}>
                            {/* Hero section - Profile header */}
                            <View style={styles.heroContainer}>

                                {/* Profile Image */}
                                <Image
                                    source={{uri: profilePhotoURL}}
                                    style={{width: '100%', height:'100%', objectFit: 'contain'}}
                                />

                            </View>

                            {/* Profile Content*/}

                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollViewContainer}
                                showsVerticalScrollIndicator={false}
                                onScrollBeginDrag={() => {
                                    setIsScrolling(true);
                                }}
                                contentContainerStyle={{paddingTop: '60%', paddingBottom: '20%'}}>

                                <View style={styles.scrollViewContent}>

                                    {/* Username and Follow button */}
                                    <View style={{
                                        width: '90%', 
                                        height: 'auto', 
                                        flexDirection: 'column', 
                                        alignSelf: 'center',
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

                                        {/* Follow button and message button*/}
                                        <View style={{
                                                padding: '2%', 
                                                marginBottom: '7%', 
                                                marginTop: '2%', 
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                            {/* Follow */}
                                            <FollowButton
                                                followerID={user.uid}
                                                followingID={accountID}
                                                followerAccountType={accountScope}
                                                followingAccountType='user'
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
        width: '100%',
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
    }
})
/* Import utilities. */
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Keyboard, 
    Pressable, 
    FlatList, 
    RefreshControl, 
    ActivityIndicator,
    Animated
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import UserNavbar from '../components/userNavbar';
import OrganiserNavbar from '../components/organiserNavbar';

/* Import Component Types */
import { 
    EventCardProps, EventCardItemProps, 
    PostComponentItemProps, PostComponentProps, 
} from '../types/UiComponentTypes';

/* Import Page Types */
import { EventPageProps, ExplorePageProps } from '../types/PageComponentTypes';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { pullPublicPosts, pullPublicEvents } from "../scripts/GatsbyFirestoreFunctions";
import { useAuthContext } from "../utilities/sessionProvider";

/* UI Callback Functions */
import { renderPost, renderEventCard, renderLoadingError } from "../scripts/FrontendFunctions";
import { FIRESTORE_DB } from '../firebaseConfig';
import ExploreSearchPage from './exploreSearchPage';

// Layout control.
const getEventFeedLayout = (_: any, index: number) => ({
    length: 350, 
    offset: 30 * index, 
    index,
});

const getPostFeedLayout = (_: any, index: number) => ({
    length: 150, 
    offset: 30 * index, 
    index,
});

/**
 * Explorable content for the user allowing
 * them to discover events and other accounts.
 * @returns Explore page
 */
export default function ExplorePageComponent({accountScope}: ExplorePageProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Manage scrolling state.
    const [isScrolling, setIsScrolling] = useState(false);

    // Mange search bar state.
    const [isSearching, setSearching] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [containsInput, setContainsInput] = useState(false);

    // Manage error state.
    const [loadingError, setLoadingError] = useState(false);

    // Check for nullish search content
    useEffect(() => {
        if(searchInput != null){
            setContainsInput(true);
        }
        if(searchInput === ''){
            setContainsInput(false);
        }
    }, [searchInput]);

    /* Keyboard state. */
    const [isKeyboardActive, setKeyboardActive] = useState(false);

    useEffect(() => {
    
        const showListener = Keyboard.addListener('keyboardWillShow', () => {
            setKeyboardActive(true);
        })
    
        const hideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardActive(false);
        })

        return() => {
            showListener.remove();
            hideListener.remove();
        }

    }, [isKeyboardActive]);

    // Manage explore context.
    const [exploreContext, setExploreContext] = useState('events');

    // State management for event feed content.
    const eventFlatListRef = useRef<FlatList | null>(null);

    // State management for post feed content.
    const postFlatListRef = useRef<FlatList | null>(null);
    
    /* FIRESTORE */
    const [isLoading, setIsLoading] = useState(true);
    const [postsFeed, setPostsFeed] = useState<PostComponentProps[] | null>(null);
    const [eventsFeed, setEventsFeed] = useState<EventCardProps[] | null>(null);

    // Fetch data from firestore.
    useEffect(() => {
        const fetch = async() => {
            const posts = await pullPublicPosts();
            const events = await pullPublicEvents();

            // Catch loading error.
            if(posts === null || events === null){
                setLoadingError(true);
            } else {
                setPostsFeed(posts);
                setEventsFeed(events);
            }
            setIsLoading(false);
        }
        fetch();
    }, []);

    /* EVENTS */

    // Render callback.
    const flatListEventsRenderer = (item: EventCardProps) => {
        const route = `(app)/${accountScope}/(explore)/(eventPage)/eventPage`
        return renderEventCard({item: item, routerCallback: () => {
            router.push({
                pathname: route,
                params: {eventID: item.id, createdBy: item.createdBy}
            })
        }})
    }

    // Event card flat list.
    const events = () => {
        return (
            <FlatList
                ref={eventFlatListRef}
                data={eventsFeed}
                ListHeaderComponent={renderFeedSelector}
                renderItem={({item}) => flatListEventsRenderer(item)}
                style={{}}
                contentContainerStyle={{paddingBottom: '25%', paddingTop: '35%'}}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                inverted={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={false} 
                        onRefresh={refreshEventFeed}
                        progressViewOffset={150} 
                    />
                }
                onScrollBeginDrag={() => {
                    setSearching(false);
                    setIsScrolling(true);
                    Keyboard.dismiss();                
                }}
            />
        )
    }

    const refreshEventFeed = async () => {
        const newEvents = await pullPublicEvents();
        setEventsFeed(newEvents);
    }

    /* POSTS */

    // Render callback.
    const flatListPostsRenderer = (item: PostComponentProps) => {
        let route: string

        // Define route to account.
        if(item.context === 'user'){
            route = `(app)/${accountScope}/(explore)/(userProfile)/userProfile`;
        } else {
            route = `(app)/${accountScope}/(explore)/(organiserProfile)/organiserProfile`;
        }

        // Catch self route.
        if(item.createdBy === user.uid){
            route = `(app)/${accountScope}/(profile)/accountProfile`
        }
        
        return renderPost({item: item, routerCallback: () => {
            router.push({
                pathname: route,
                params: {accountID: item.createdBy}
            })
        }})
    }

    const posts = () => {
        return(
            <FlatList
            ref={postFlatListRef}
            data={postsFeed}
            ListHeaderComponent={renderFeedSelector}
            renderItem={({item}) => flatListPostsRenderer(item)}
            style={{}}
            contentContainerStyle={{paddingBottom: '25%', paddingTop: '35%'}}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            inverted={false}
            refreshControl={
                <RefreshControl 
                    refreshing={false} 
                    onRefresh={refreshPostFeed}
                    progressViewOffset={150} 
                />
            }
            onScrollBeginDrag={() => {
                setSearching(false);
                setIsScrolling(true);
                Keyboard.dismiss();
            }}
            onEndReached={() => console.log('end')}
        />   
        )
    }

    const refreshPostFeed =  async () => {
        const newFeed = await pullPublicPosts();
        setPostsFeed(newFeed);
    }

    // Feed selector render callback.
    const renderFeedSelector = ()  => {
        return(
            // Feed selector
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20}}>
                <TouchableOpacity style={exploreContext === 'events'? styles.selectedHeader: styles.unselectedHeader}
                    onPress={() => {setExploreContext('events')}} activeOpacity={0.6}>
                    <Text style={[styles.feedHeader]}>
                        Events
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={exploreContext === 'people'? styles.selectedHeader: styles.unselectedHeader}
                    onPress={() => {setExploreContext('people')}} activeOpacity={0.6}>
                    <Text style={styles.feedHeader}>
                        Posts
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    // Loading state.
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

            {/* Screen content */}
            
            {/* Search bar */}
            <View style={[
                    styles.searchBarContainer, 
                    {
                        opacity: isSearching? 1:0.3, 
                        backgroundColor: isSearching? 'rgba(256, 256, 256, 1)': 'transparent'
                    }
                ]} 
                >

                {/* Search icon */}
                <View style={{
                    height: 35, 
                    width: 35, 
                    backgroundColor: GatsbyStyles.gatsbyColours.gold,
                    borderRadius: 35,
                    justifyContent: 'center',
                    alignItems: 'center',
                    }}>
                    <Image
                        source={require('../assets/Utilities/SearchIcon.png')}
                        style={{
                            height: 20,
                            width: 20, 
                            objectFit: 'contain',
                            tintColor: GatsbyStyles.gatsbyColours.white
                        }}
                    />
                </View>

                {/* Input field */}
                <View style={styles.searchBarInputContainer}>
                    <TextInput
                        placeholder='Search ...'
                        placeholderTextColor='rgba(0, 0, 0, 0.6)'
                        style={{
                            fontSize: 15,
                            height: '90%',
                            width: '90%',
                            alignSelf: 'center',
                            color: 'rgba(0, 0, 0, 0.8)'
                        }}
                        onPressIn={() => setSearching(true)}
                        value={searchInput}
                        onChangeText={(text) => {
                            setSearchInput(text);
                        }}
                    />
                </View>

                {/* Clear search */}
                {isSearching?
                    <TouchableOpacity style={styles.deleteSearchIcon} 
                        onPress={() => {
                            setSearchInput('');
                            Keyboard.dismiss();
                            setSearching(false);
                            }
                        }>
                            <Image
                                source={require('../assets/Utilities/CancelSearchIcon.png')}
                                style={{
                                    width: 30,
                                    height: 30,
                                    objectFit: 'contain'
                                }}
                            />                      
                    </TouchableOpacity>
                    :
                    <></>
                }

            </View>

            {/* Page */}
            {isSearching? 
                // Searched content.
                <View style={styles.explorableContentContainer}>
                    <ExploreSearchPage
                        accountScope={accountScope}
                        searchString={searchInput}
                    />
                </View>
            :
                // Explorable content.
                <View style={styles.explorableContentContainer}>
                    {isLoading? 
                        loading()
                    :
                        loadingError?
                            renderLoadingError()
                        :
                            // Explorable content.
                            exploreContext === 'events'?
                                eventsFeed && eventsFeed.length > 0 ? 
                                    events()
                                :
                                    <View style={{marginTop: '35%'}}>
                                        {renderFeedSelector()}
                                    </View> 
                            :
                                postsFeed && postsFeed.length > 0 ? 
                                    posts()
                                :
                                    <View style={{marginTop: '35%'}}>
                                        {renderFeedSelector()}
                                    </View>   
                    }
                </View>            
            }

            {/* Render User Navigation bar */}
            {accountScope === 'user'? 
                <UserNavbar
                    navigationState='explore'
                    isParentScrolling={isScrolling}
                />                
            :
                <OrganiserNavbar
                    navigationState='explore'
                    isParentScrolling={isScrolling}
                />
            }

        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    // Search bar
    searchBarContainer:{
        width: '90%',
        height: 50,
        borderWidth: 2, 
        borderColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 30, 
        alignSelf: 'center',
        position: 'absolute',
        top: '7.5%',
        zIndex: 1,
        padding: 5,
        alignItems: 'center',
        flexDirection: 'row',
    },
    searchBarInputContainer:{
        width: '80%',
        height: '90%',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    deleteSearchIcon:{
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf : 'center',
    },
    // Explorable content
    explorableContentContainer:{
        height: '100%',
        width: '100%',
        alignSelf: 'center',
    },
    feedHeader:{
        fontSize: 20,
        fontWeight: '600',
        color:  GatsbyStyles.gatsbyColours.black
    },
    selectedHeader:{
        borderBottomColor: GatsbyStyles.gatsbyColours.gold,
        borderBottomWidth: 3
    },
    unselectedHeader:{
    },
    eventFeedContainer:{
        width: '90%',
        height: '100%'
    }
})
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
    Animated,
    ScrollView
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import UserAccountDetails from '../components/userAccountDetails';
import OrganiserAccountDetails from '../components/organiserAccountDetails';

/* Import Component Types */
import { EventCardProps } from '../types/UiComponentTypes';

/* Import Page Types */
import { ExploreSearchPageProps } from '../types/PageComponentTypes';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Services */
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { pullPublicPosts, pullPublicEvents } from "../scripts/GatsbyFirestoreFunctions";
import { FIRESTORE_DB } from '../firebaseConfig';
import { EventDocument } from '../types/GatsbyFirestoreTypes';
import { useAuthContext } from '../utilities/sessionProvider';

/* UI Callback Functions */
import { renderEventCardFromDoc, renderLoadingError } from "../scripts/FrontendFunctions";

/**
 * Used to navigate user search queries.
 *  
 * @param {ExploreSearchPageProps} 
 * @returns Explore Search Page
 */
export default function ExploreSearchPage({searchString, accountScope}: ExploreSearchPageProps){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Scrolling state.
    const [isScrolling, setIsScrolling] = useState(false);

    // Valid search state.
    const [validSearch, setValidSearch] = useState(false);

    // Search context.
    const [searchContext, setSearchContext] = useState('users');

    // Searched information.
    const [userAccounts, setUserAccounts] = useState<string[] | null>(null);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    const [organiserAccounts, setOrganiserAccounts] = useState<string[] | null>(null);
    const [isSearchingOrganisers, setIsSearchingOrganisers] = useState(false);

    const [events, setEvents] = useState<EventDocument[] | null>(null);
    const [isSearchingEvents, setIsSearchingEvents] = useState(false);

    // Manage error state.
    const [loadingError, setLoadingError] = useState(false);

    /* SEARCH */

    // Performs each search asynchronously on layout.
    useEffect(() => {

        // Users.
        async function searchUsers(){
            setIsSearchingUsers(true);
            await queryUsers({firestoreSearch: searchString});
            setIsSearchingUsers(false);
        }

        // Organisers.
        async function searchOrganisers(){
            setIsSearchingOrganisers(true);
            await queryOrganisers({firestoreSearch: searchString});
            setIsSearchingOrganisers(false);
        }

        // Events.
        async function searchEvents(){
            setIsSearchingEvents(true);
            await queryEvents({firestoreSearch: searchString});
            setIsSearchingEvents(false);
        }

        searchUsers();
        searchOrganisers();
        searchEvents();

    }, [searchString])

    /* FIRESTORE QUERIES */

    // Users.
    async function queryUsers({firestoreSearch}){
        // Test string for whitespace.
        const regEx = /\S/;
        if(!regEx.test(firestoreSearch)){
            console.log(`ignore`);
            setUserAccounts([]);
            setValidSearch(false);
            return;
        } else {
            try{
                setValidSearch(true);
                const userAccounts = collection(FIRESTORE_DB, 'UserAccounts');
                const querySnap = await getDocs(userAccounts);
    
                if(querySnap === null || querySnap === undefined){
                    throw new Error("Null query");
                }
        
                const virtualUserList: string[] = []
                querySnap.docs.forEach((doc) => {
                    const data = doc.data();
    
                    const firestoreString = data.username.toLowerCase();
                    const searchString = firestoreSearch.toLowerCase();
    
                    console.log(`search string: ${searchString}`);
    
                    if(firestoreString.includes(searchString)){
                        virtualUserList.push(data.accountID);
                        console.log(`Query: ${JSON.stringify(data.username)}`)
                    }
    
                })
    
                setUserAccounts(virtualUserList);

            } catch (error) {
                console.log(`Error performing user query ${error}`);
                setLoadingError(true);
            }
        }
    }

    // Organisers.
    async function queryOrganisers({firestoreSearch}){
        // Test string for whitespace.
        const regEx = /\S/;
        if(!regEx.test(firestoreSearch)){
            console.log(`ignore`);
            setOrganiserAccounts([]);
            setValidSearch(false);
            return;
        } else {
            try{
                setValidSearch(true);
                const organiserAccounts = collection(FIRESTORE_DB, 'OrganiserAccounts');
                const querySnap = await getDocs(organiserAccounts);
    
                if(querySnap === null || querySnap === undefined){
                    throw new Error("Null query");
                }
        
                const virtualArray: string[] = []
                querySnap.docs.forEach((doc) => {
                    const data = doc.data();
    
                    const firestoreString = data.username.toLowerCase();
                    const searchString = firestoreSearch.toLowerCase();
    
                    console.log(`search string: ${searchString}`);
    
                    if(firestoreString.includes(searchString)){
                        virtualArray.push(data.accountID);
                        console.log(`Query: ${JSON.stringify(data.username)}`)
                    }
    
                })
    
                setOrganiserAccounts(virtualArray);

            } catch (error) {
                console.log(`Error performing organiser query ${error}`);
                setLoadingError(true);
            }
        }
    }

    // Events.
    async function queryEvents({firestoreSearch}){
        // Test string for whitespace.
        const regEx = /\S/;
        if(!regEx.test(firestoreSearch)){
            console.log(`ignore`);
            setEvents([]);
            setValidSearch(false);
            return;
        } else {
            try{
                setValidSearch(true);
                const eventDocs = collection(FIRESTORE_DB, 'EventsDB');
                const querySnap = await getDocs(eventDocs);
    
                if(querySnap === null || querySnap === undefined){
                    throw new Error("Null query");
                }
        
                const virtualArray: any[] = []
                querySnap.docs.forEach((doc) => {
                    const data = doc.data();
    
                    const firestoreString = data.eventName.toLowerCase();
                    const searchString = firestoreSearch.toLowerCase();
    
                    console.log(`search string: ${searchString}`);
    
                    if(firestoreString.includes(searchString)){
                        virtualArray.push(data);
                        console.log(`Query: ${JSON.stringify(data.eventID)}`)
                    }
    
                })
    
                setEvents(virtualArray);

            } catch (error) {
                console.log(`Error performing organiser query ${error}`);
                setLoadingError(true);
            }
        }
    }

    /* RENDER */

    // Render user account.
    const renderUserAccount = (accountID: string) => {
        
        // Routing.
        let route: () => void;
        if(accountID !== user.uid){
            route = () => {
                router.push({
                    pathname: `(app)/${accountScope}/(explore)/(userProfile)/userProfile`,
                    params: {accountID: accountID}
                })
            }
        } else {
            route = () => {
                router.push(`(app)/user/(profile)/accountProfile`);
            }
        }

        return(
            <Pressable key={accountID} style={[accountID === user.uid? styles.spidermanMeme : {}, styles.resultAccount]} onPress={route}>
                <UserAccountDetails
                    accountID={accountID}
                />
            </Pressable>
        )
    }

    // Render organiser account.
    const renderOrganiserAccount = (accountID: string) => {

        // Routing.
        let route: () => void;
        if(accountID !== user.uid){
            route = () => {
                router.push({
                    pathname: `(app)/${accountScope}/(explore)/(organiserProfile)/organiserProfile`,
                    params: {accountID: accountID}
                })
            }
        } else {
            route = () => {
                router.push(`(app)/organiser/(profile)/accountProfile`);
            }
        }

        return(
            <Pressable key={accountID} style={[accountID === user.uid? styles.spidermanMeme : {}, styles.resultAccount]} onPress={route}>
                <OrganiserAccountDetails
                    accountID={accountID}
                />
            </Pressable>
        )
    }

    // Text to prompt an empty search result.
    const noSearch = () => {
        return(
            <Text style={{
                fontSize: 20,
                fontWeight: '500',
                color: GatsbyStyles.gatsbyColours.grey,
                alignSelf: 'center',
                marginTop: '10%',
            }}>
                Type to search ...
            </Text>
        )
    }

    // Text to prompt an empty search result.
    const emptySearch = () => {
        return(
            <Text style={{
                fontSize: 20,
                fontWeight: '500',
                color: GatsbyStyles.gatsbyColours.grey,
                alignSelf: 'center',
                marginTop: '10%',
            }}>
                No results found
            </Text>
        )
    }

    // Indicator for loading state.
    const loading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    // Set search context callback.
    const setSearchContextCallback = (context: string) => {
        setSearchContext(context);
        setIsScrolling(false);
    }

    /* SUBPAGES */

    // Users.
    const userSearchSubPage = () => {
        return(
            validSearch?
                isSearchingUsers? 
                    loading()
                :
                    userAccounts && userAccounts.length > 0 ?
                        userAccounts.map((item) => renderUserAccount(item))
                    :
                        emptySearch()
            :
                noSearch()
        )
    }

    // Organisers.
    const organiserSearchSubPage = () => {
        return(
            validSearch?
                isSearchingOrganisers? 
                    loading()
                :
                    organiserAccounts && organiserAccounts.length > 0 ?
                        organiserAccounts.map((item) => renderOrganiserAccount(item))
                    :
                        emptySearch()
            :
                noSearch()
        )
    }

    // Events.
    const eventsSearchSubPage = () => {
        return(
            validSearch?
                isSearchingEvents? 
                    loading()
                :
                    events && events.length > 0 ?
                        <View style={{marginTop: '5%'}}>
                            {events.map((item) => renderEventCardFromDoc(
                                {
                                    item: item, 
                                    routerCallback: () => {
                                        router.push({
                                            pathname: `(app)/${accountScope}/(explore)/(eventPage)/eventPage`,
                                            params: {eventID: item.eventID, createdBy: item.createdBy}
                                        })
                                    }
                                }
                            ))}
                        </View>
                    :
                        emptySearch()
            :
                noSearch()
        )
    }

    /* SEARCH RESULT */
    const renderSearchResult = () => {
        return(
            <ScrollView 
                style={{
                    width: '100%', 
                    height: '100%',
                }}
                contentContainerStyle={{
                    paddingTop: '45%',
                    paddingBottom: '25%',
                }}
                keyboardShouldPersistTaps='never'
                showsVerticalScrollIndicator={true}
                onScrollBeginDrag={() => setIsScrolling(true)}>

                {searchContext === 'users'? 
                    userSearchSubPage() 
                : 
                    searchContext === 'organisers'? 
                        organiserSearchSubPage() 
                    : 
                        eventsSearchSubPage()
                }
            </ScrollView>
        )
    }

    return(
        // Explore search page.
        <View style={{width: '100%', height: '100%'}}>
            {/* Search context selector */}
            <View style={[styles.searchContextContainer, {opacity: isScrolling? 0.3 : 1}]}>
                {/* Users */}
                <Pressable style={
                    searchContext === 'users'? 
                        styles.selectedSearchContextField
                    :
                        styles.searchContextField
                    } 
                    onPress={() => setSearchContextCallback('users')}>
                    <Text style={
                        searchContext === 'users'? 
                            styles.searchContextTextSelected
                        :
                            styles.searchContextTextUnselected
                        }
                    >
                        Users
                    </Text>
                </Pressable>

                {/* Organisers */}
                <Pressable style={
                    searchContext === 'organisers'? 
                        styles.selectedSearchContextField
                    :
                        styles.searchContextField
                    } 
                    onPress={() => setSearchContextCallback('organisers')}>
                    <Text style={
                        searchContext === 'organisers'? 
                            styles.searchContextTextSelected
                        :
                            styles.searchContextTextUnselected
                        }
                    >
                        Organisers
                    </Text>
                </Pressable>

                {/* Events */}
                <Pressable style={
                    searchContext === 'events'? 
                        styles.selectedSearchContextField
                    :
                        styles.searchContextField
                    } 
                    onPress={() => setSearchContextCallback('events')}>
                    <Text style={
                        searchContext === 'events'? 
                            styles.searchContextTextSelected
                        :
                            styles.searchContextTextUnselected
                        }
                    >
                        Events
                    </Text>
                </Pressable>
            </View>


            {/* Search result */}
            {
                loadingError?
                    renderLoadingError()
                :
                    renderSearchResult()
            }
        </View>
    )
}

/* Page styles */
const styles = StyleSheet.create({
    searchTypeText:{
        fontSize: 20,
        fontWeight: '600',
        margin: '5%',
        color:  GatsbyStyles.gatsbyColours.black
    },
    searchContextContainer:{
        position: 'absolute',
        top: '16%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        zIndex: 1
    },
    searchContextField:{
        backgroundColor: GatsbyStyles.gatsbyColours.grey,
        height: 35,
        width: 110,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectedSearchContextField:{
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        height: 35,
        width: 110,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchContextTextUnselected:{
        color: GatsbyStyles.gatsbyColours.black,
        fontSize: 17,
        fontWeight: '700'
    },
    searchContextTextSelected:{
        color: GatsbyStyles.gatsbyColours.white,
        fontSize: 17,
        fontWeight: '700'
    },
    resultAccount:{
        width: '95%',
        marginTop: '3%',
        alignSelf: 'center',
    },
    spidermanMeme:{
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        borderRadius: 50,
        opacity: 0.5,
    }
})
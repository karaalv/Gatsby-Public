/* Import utilities. */
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

/* Import Custom Components */
import UserNavbar from "../../../../components/userNavbar";

/* Import Component Types */
import { PostComponentItemProps, PostComponentProps } from "../../../../types/UiComponentTypes";

/* Import Custom Styles */
import * as GatsbyStyles from '../../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { useAuthContext } from "../../../../utilities/sessionProvider";
import { pullPublicPosts } from "../../../../scripts/GatsbyFirestoreFunctions";

/* UI Callback Functions */
import { renderPost, renderLoadingError } from "../../../../scripts/FrontendFunctions";

/**
 * Layout properties of feed carousel defined
 * in this callback, default post height used.
 */
const getItemLayout = (data: any, index: number) => ({
    length: 150, 
    offset: 50 * index, 
    index,
});

/**
 * This page renders the users home page.
 * This page shows their feed which consists of
 * posts from users they follow.
 * 
 * Additionally, this page acts as the entry point
 * to a users message inbox.
 * 
 * @returns User homepage.
 */
export default function UserHome(){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for feed content.
    const flatListRef = useRef<FlatList | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    const [loadingError, setLoadingError] = useState(false);

    /* FIRESTORE */
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [pulledFeed, setPulledFeed] = useState<PostComponentProps[] | null>(null);

    // Load feed.
    useEffect(() => {
        const fetchAccountFeed = async () => {
            const data = await pullPublicPosts();
            // Check for loading error.
            if(data === null){
                setLoadingError(true);
            } else {
                setPulledFeed(data);
            }
            setIsLoadingPosts(false);
        }
        fetchAccountFeed();
    }, [])

    const flatListRender = (item: PostComponentProps) => {
        let route: string

        // Define route to account.
        if(item.context === 'user'){
            route = '(app)/user/(home)/(userProfile)/userProfile';
        } else {
            route = '(app)/user/(home)/(organiserProfile)/organiserProfile';
        }

        // Catch self route.
        if(item.createdBy === user.uid){
            route = `(app)/user/(profile)/accountProfile`
        }

        return renderPost({item: item, routerCallback: () => {
            router.push({
                pathname: route,
                params: {accountID: item.createdBy}
            })
        }})
    }

    // Callback to render post components.
    const feed = () => {
        return(
            <FlatList
                ref={flatListRef}
                data={pulledFeed}
                renderItem={({item}) => flatListRender(item)}
                initialNumToRender={3}
                style={styles.flatList}
                contentContainerStyle={{paddingTop: '35%', paddingBottom: '20%'}}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => setIsScrolling(true)}
                inverted={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={false} 
                        onRefresh={feedRefresh}
                        progressViewOffset={75} 
                    />
                }
            />
        )
    }

    // Loading state for account posts.
    const feedLoading = () => {
        return(
            <ActivityIndicator style={{marginTop: '50%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    // Refresh feed on drag down.
    const feedRefresh = async() => {
        const newFeed = await pullPublicPosts();
        setPulledFeed(newFeed);
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         * 
         * Remove vertical inset to allow post 
         * elements to emerge from device frame.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: GatsbyStyles.gatsbyColours.white,
            flex: 1,
        }}>

            {/* Screen content */}
            
            {/* Inbox icon */}
            <TouchableOpacity style={styles.inboxIcon} onPress={() => {router.push('(app)/user/(home)/inbox')}}>
                <Image
                    source={require('../../../../assets/Utilities/InboxIcon.png')}
                    style={{height: 40, width: 40, objectFit: 'contain'}}
                />
            </TouchableOpacity>

            {/* User feed */}
            {isLoadingPosts?
                feedLoading()
            :
                loadingError?
                    renderLoadingError()
                :
                    pulledFeed && pulledFeed.length > 0 ?
                        feed()
                    :
                        <></>
            }

            {/* Render User Navigation bar */}
            <UserNavbar
                navigationState='home'
                isParentScrolling={isScrolling}
            />

        </View>
    );
}

/* Page Styles. */
const styles = StyleSheet.create({
    inboxIcon:{
        position: 'absolute',
        right: '5%',
        top: '7.5%',
        width: 40,
        height: 40,
        alignSelf: 'flex-end',
        zIndex: 1
    },
    flatList:{
        height: '100%',
    }
})
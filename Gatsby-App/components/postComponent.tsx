/* Import utilities. */
import { 
    TouchableOpacity, Text, 
    StyleSheet, View, 
    Pressable, ActivityIndicator 
} from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { useAccountTypeContext } from "../utilities/accountTypeProvider";
import { useAuthContext } from "../utilities/sessionProvider";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Component Types */
import { PostComponentProps } from "../types/UiComponentTypes";

/* Import Firebase Services */
import { pullAccountInfo, likeUnlikePost, isPostLiked } from "../scripts/GatsbyFirestoreFunctions";
import { DocumentReference, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from "../firebaseConfig";

/**
 * Post component used to share account posts
 * on the application.
 * 
 * This singular component wraps both
 * user and organiser posts, based on the 
 * context the UI is adjusted accordingly.
 * 
 * Post content has variable height, based on
 * content the height of the component is adjusted
 * dynamically.
 * 
 * @param {PostComponentProps}
 * @returns Post Component
 */
export default function PostComponent({createdBy, context, username, profileImage, 
    containsMedia, contentHeight, mediaImage, content, routerCallback, likes, postID}: PostComponentProps){

    // Details of account observing post.
    const { user } = useAuthContext();
    const accountObservingType = useAccountTypeContext();

    // Perform heigh adjustment to UI based on content.
    let mediaHeight = 0;
    if(containsMedia){
        mediaHeight = 225
    }

    // Height variables.
    const likeButtonHeight = 110;
    const postContainerHeight = Math.max(150, (mediaHeight +  contentHeight + likeButtonHeight));
    const postContentHeight = contentHeight;

    // Post liked state.
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState<number>(likes);

    /* FIRESTORE */
    const [pulledUsername, setUsername] = useState(null);
    const [profilePhotoURL, setProfilePhotoURL] = useState(null);

    // Manage network state.
    const [loadingError, setLoadingError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const likePost = async (bias: boolean) => {
        const response = await likeUnlikePost({
            postID: postID, 
            createdBy: createdBy, 
            accountType: context, 
            accountLikingID: user.uid, 
            accountLikingType: accountObservingType, 
            isLiking: bias
        });

        // Check network error.
        if(response === null){
            setLoadingError(true);
        }
    }

    // Fetch like state and like count.
    useEffect(() => {
        // Account like array.
        let accountRef: DocumentReference
        if(accountObservingType === 'user'){
            accountRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${user.uid}`,
            );
        } else {
            accountRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${user.uid}`,
            );
        }

        const unsubscribeToLikeState = onSnapshot(
            // Document reference.
            accountRef, 
            // Snapshot callback.
            (docSnap) => {
                const {likedPosts} = docSnap.data();
                if(likedPosts.includes(postID)){
                    setIsLiked(true);
                } else {
                    setIsLiked(false);
                }
            },
            // Snapshot error callback.
            () => {
                setLoadingError(true);
            }
        )

        // Like count.
        const postRef = doc(FIRESTORE_DB, 'PostsDB', postID);
        const unsubscribeToLikeCount = onSnapshot(
            // Document reference.
            postRef,
            // Snapshot callback. 
            (docSnap) => {
                const {likes} = docSnap.data()
                setLikeCount(likes);
            },
            // Snapshot error callback.
            () => {
                setLoadingError(true);
            }
        )

        return () => {
            unsubscribeToLikeCount();
            unsubscribeToLikeState();
        }
    }, [])

    // Load post data.
    useEffect(() => {
        const fetchData = async() => {
            const data = await pullAccountInfo({accountID: createdBy, context: context});

            // Check for loading error.
            if(data === null){
                setLoadingError(true);
            } else {
                setUsername(data.username);
                if(context === 'user'){
                    setProfilePhotoURL(data.profileImage);
                } else {
                    setProfilePhotoURL(data.organiserLogo);
                }
            }
            setIsLoading(false);
        }
        fetchData();
    }, [])

    /* RENDER CALLBACKS */

    const loading = () => {
        return(
            <ActivityIndicator style={{top: '40%'}} size={'large'} color={GatsbyStyles.gatsbyColours.grey}/>
        )
    }

    const loadingPostError = () => {
        return(
            <View style={{
                flexDirection: 'row', 
                position: 'absolute',
                top: '50%',
                alignSelf: 'center',
                alignItems: 'center',
                }}>
                <Image
                    source={require('../assets/Utilities/ErrorIcon.png')}
                    style={{
                        width: 30,
                        height: 30,
                        objectFit: 'contain',
                        tintColor: GatsbyStyles.gatsbyColours.red
                    }}
                />
                <Text style={{
                    fontSize: 16, 
                    fontWeight: '700',
                    color: GatsbyStyles.gatsbyColours.red,
                    marginLeft: '10%'
                }}>
                    Network error 
                </Text>
            </View>
        )
    }

    return(
        // Post container.
        <View style={[styles.postContainer, {height: postContainerHeight}]}>

            {
                isLoading?
                    loading()
                :
                    loadingError?
                        loadingPostError()
                    :
                        // Post content
                        <View style={{width: '100%', height: '100%'}}>
                            {/* Post profile header */}
                            <View style={styles.postHeader}>
                                <Pressable style={{
                                    width: 'auto', 
                                    height: 'auto', 
                                    flexDirection: 'row', 
                                    alignItems: 'center',
                                    padding: '2%',
                                    alignSelf: 'flex-start', 
                                }}
                                onPress={() => routerCallback()}>
                                <Image
                                    source={{uri: profilePhotoURL}}
                                    style ={{
                                        height: 35,
                                        width: 35, 
                                        objectFit: 'contain',
                                        borderWidth: 2, 
                                        borderRadius: context === 'user'? 20: 5,
                                        margin: '2%'
                                    }}
                                />
                                <Text style={
                                    [
                                        GatsbyStyles.textStyles.mediumText, 
                                        {
                                            padding: '4%', 
                                            fontWeight: 'bold', 
                                            height: 'auto', 
                                            width: 'auto',
                                            maxWidth: '80%',
                                            flexWrap: 'wrap',
                                        }
                                    ]
                                    }>
                                    {pulledUsername}
                                </Text>
                                </Pressable>
                            </View>

                            {/* Post content */}
                            <View style={[styles.postContentContainer, {height: postContentHeight}]}>
                                
                                {/* If post contains media, generate media component */}
                                {containsMedia ? 
                                    <View style={{
                                                width: '100%', 
                                                height: mediaHeight, 
                                                marginBottom: '5%',
                                            }}>
                                        <Image
                                            source={{uri: mediaImage}}
                                            style={{
                                                width: '100%', 
                                                height: 225, 
                                                objectFit: 'contain', 
                                                alignSelf: 'center',
                                                borderRadius: 10,
                                                borderWidth: 2,
                                                borderColor: 'rgba(0,0,0,0.4)'
                                            }}
                                        />
                                    </View>
                                : 
                                    <></>
                                }

                                {/* Post text component */}
                                <View>
                                    <Text style={GatsbyStyles.textStyles.mediumText}>
                                        {content}
                                    </Text>
                                </View>

                            </View>


                            {/* Likes */}
                            <View style={styles.likesContainer}>
                                <View style={
                                    {
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        alignSelf: 'flex-end',
                                        margin: '2%'
                                    }
                                        }>
                                    <Text style={[
                                        styles.likesNumber,
                                        {color: isLiked? GatsbyStyles.gatsbyColours.red : GatsbyStyles.gatsbyColours.black}
                                        ]}>
                                        {likeCount}
                                    </Text>
                                    {/* Like button */}
                                    <TouchableOpacity onPress={() => {isLiked? likePost(false) : likePost(true)}} style={styles.likeButton} activeOpacity={0.3}>
                                        <Image
                                            source={require('../assets/Utilities/LikeButtonIcon.png')}
                                            style={{height: 30, width: 35, objectFit: 'contain'}}
                                            tintColor={isLiked? GatsbyStyles.gatsbyColours.red : GatsbyStyles.gatsbyColours.black}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
            }

        </View>
    )
}

/* Component styles */
const styles = StyleSheet.create({
    postContainer:{
        width: '87.5%',
        borderColor: GatsbyStyles.gatsbyColours.black,
        borderWidth: 3,
        borderRadius: 10,
        alignSelf: 'center',
    },
    postContentContainer:{
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    likesContainer:{
        position: 'absolute',
        bottom: '0%',
        alignSelf: 'center',
        alignItems: 'center',
        width: '100%',
    },
    likesNumber:{
        fontSize: 18,
        fontWeight: '600',
        marginRight: '2%',
    },
    likeButton:{
        alignSelf: 'flex-end',
        margin: '3%'
    },
    postHeader:{
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        alignItems:'center',
    }
})
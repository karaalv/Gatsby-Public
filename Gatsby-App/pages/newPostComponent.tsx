/* Import utilities. */
import { 
    View, Text, StyleSheet, TouchableOpacity, TextInput, 
    Keyboard, Animated, Pressable, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/* Import Custom Components */
import BackNavigationButton from '../components/backNavigationButton';

/* Import Page Types */
import { NewPostPage } from '../types/PageComponentTypes';

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Firebase Functions */
import { 
    ref, getDownloadURL, uploadBytesResumable 
} from "firebase/storage";
import { 
    doc, updateDoc, DocumentReference, 
} from "firebase/firestore";
import { FIRESTORE_STORAGE, FIRESTORE_DB } from '../firebaseConfig';
import { useAuthContext } from '../utilities/sessionProvider';

/* Import Firebase Functions */
import { pushNewPost } from '../scripts/GatsbyFirestoreFunctions';

/* Callback functions */

// Callback used to push image to storage.
async function uploadImage({imageURI, uid, context, postID}){
    try{
        // Define upload path.
        const storageRef = ref(
            FIRESTORE_STORAGE, 
            `Posts/${postID}/Media.jpg`
        );

        // Fetch image blob.
        const response = await fetch(imageURI);
        const blob = await response.blob();

        // Set image metadata.
        const metaData = {
            contentType: 'image/jpeg',
        }

        // Upload image to storage.
        uploadBytesResumable(storageRef, blob, metaData)
            .then(() => {
                getDownloadURL(storageRef)
                    .then(async (url) => {
                        // Update post document.
                        let postDocRef: DocumentReference;
                        // Set document reference.
                        if(context === 'user'){
                            postDocRef = doc(
                                FIRESTORE_DB, 
                                'UserAccounts', 
                                `user_${uid}`, 
                                'postsSubCollection', 
                                postID
                            );
                        } else {
                            postDocRef = doc(
                                FIRESTORE_DB, 
                                'OrganiserAccounts', 
                                `organiser_${uid}`, 
                                'postsSubCollection', 
                                postID
                            );
                        }

                        const postDB = doc(
                            FIRESTORE_DB, 
                            'PostsDB', 
                            postID
                        );
                        // Update post document.
                        await updateDoc(postDocRef, {
                            media: url
                        })
                        await updateDoc(postDB, {
                            media: url
                        })

                    })
            })
    } catch (error){
        console.log(`Error uploading user image: ${error}`);
    }
}

/**
 * This page allows users to create new posts 
 * on the platform. The UI adjust its height 
 * dynamically depending on the content in
 * the post.
 * 
 * In the event the user has selected media the
 * container translates vertically.
 * @returns New post page
 */
export default function NewPostComponent({context}: NewPostPage){
    // Obtain user ID from Auth context.
    const { user } = useAuthContext();

    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // Input text state.
    const [inputText, setInputText] = useState('');
    const [inputHeight, setInputHeight] = useState(1);

    // Media state.
    const [containsMedia, setContainsMedia] = useState(false);
    const [selectedMedia, setMedia] = useState<string|null>(null);

    let mediaHeight = 0;
    if(containsMedia){
        mediaHeight = 225;
    }

    // Height variables.
    const likeButtonHeight = 105;
    const mediaOffset = 125;
    const postContainerHeight = Math.min(450, Math.max(150, (mediaHeight +  inputHeight + likeButtonHeight)));
    const postContentHeight = Math.min(150, (Math.round((inputHeight/10))*10) + 10);

    // Height control callback.
    const heightController = (nativeHeight: number) =>{
        const contentHeight = Math.round(nativeHeight);
        setInputHeight(contentHeight);        
    }

    // New line state effect.
    useEffect(() => {
        let offset = Math.min(100, Math.round(inputHeight/10) * 10);

        if(containsMedia){
            offset += mediaOffset
        }

        setAnimationOffset(offset)

    }, [inputHeight])
    
    /**
     * Select media from device callback.
     */
    const selectMedia = async () => {
        let media = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1
        })
        if(media.assets){
            setContainsMedia(true);
            setAnimationOffset(animationOffset + mediaOffset);
            setMedia(media.assets[0].uri);
        }
    }

    /**
     * Deselect media from device callback.
     */
    const deselectMedia = async () => {
        if(selectedMedia){
            setContainsMedia(false);
            setAnimationOffset(animationOffset - mediaOffset);
            setMedia(null);
        }
    }

    /* Keyboard state. */
    const [isKeyboardActive, setKeyboardActive] = useState(Keyboard.isVisible);

    useEffect(() => {
        const showListener = Keyboard.addListener('keyboardWillShow', () => {
            setKeyboardActive(true);
        })

        const hideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardActive(false);
        })

        return () => {
            showListener.remove();
            hideListener.remove();
        }

    }, [isKeyboardActive]);

    /* Animation state. */
    const translateY = useRef(new Animated.Value(0)).current;
    const [animationOffset, setAnimationOffset] = useState(0);

    useEffect(() => {

        if(isKeyboardActive){
            Animated.timing(translateY, {
                toValue: -animationOffset,
                duration: 150,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }).start();
        }

    }, [animationOffset, isKeyboardActive]);

    // State management for loading.
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Error state.
    const [publishError, setPublishError] = useState<boolean>(false);

    /**
     * Publish post callback.
     */
    const publishPost = async () => {

        try{
            setIsLoading(true);

            // Push document to firestore.
            const postID = await pushNewPost({
                accountID: user.uid,
                context: context,
                content: inputText,
                contentHeight: containsMedia? (postContentHeight + 30) : postContentHeight 
            })

            if(postID === null){
                throw new Error("Null post ID");
            }
    
            // Push image to storage.
            await uploadImage({
                imageURI: selectedMedia,
                uid: user.uid,
                context: context,
                postID: postID
            })
            
            /* NAVIGATE BACK */
            setPublishError(false);
            router.back();

        } catch (error) {
            setIsLoading(false);
            setPublishError(true);
            console.log(`Error creating new post: ${error}`);
        }

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
            {/* Screen content */}

            {/* Content wrapper for keyboard dismissal */}
            <Pressable style={{height: '100%', width: 'auto'}} onPress={Keyboard.dismiss}>
            
                {/* Back Button */}
                <View style={{position: 'absolute', top: '7.5%', left: '0%', zIndex: 3, opacity: inputText? 0.3:1}}>
                    <BackNavigationButton
                        onPress={() => router.back()}
                    />
                </View>

                <Animated.View style={{
                        transform: Platform.OS === 'ios'? [{translateY: translateY}] : [],
                        top: '30%',
                    }}>

                    {/* Post input container */}
                    <View style={[styles.newPostInputContainer, {height: postContainerHeight}]}>

                        {/* Image upload */}
                        <TouchableOpacity style={styles.imageUploadContainer} onPress={selectMedia}>

                            {/* Render Image if selected for post */}
                            {containsMedia? 
                                // Image selected.
                                <View>
                                    <Image
                                        source={{uri: `${selectedMedia}`}}
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
                                    <TouchableOpacity style={styles.deleteImageIcon} activeOpacity={0.6} onPress={deselectMedia}>
                                        <Text style={
                                            {
                                                fontSize: 14, 
                                                textAlign: 'center', 
                                                textAlignVertical: 'top', 
                                                opacity: 0.7,
                                                fontWeight: '800'
                                            }
                                        }>X</Text>
                                    </TouchableOpacity> 
                                </View>
                                :
                                // No image selected.
                                <View style={styles.selectImageIcon}>
                                    <Text style={{fontSize: 15, textAlign: 'center'}}>Select Image</Text>
                                </View>
                            }
                            
                        </TouchableOpacity>

                        {/* Text input field */}
                        <TextInput 
                            style={[styles.textInput, {height: postContentHeight}]}
                            placeholder='Say Something ...'
                            multiline={true}
                            value={inputText}
                            onContentSizeChange={(event) => {
                                // Set input container heights.
                                heightController(event.nativeEvent.contentSize.height);
                            }}
                            
                            onChangeText={(text) => {
                                // Set input text state.
                                setInputText(text);
                            }}
                        />

                    </View>
                </Animated.View>

                {/* Post submission button */}
                <View style={styles.postSubmissionContainer}>
                    {publishError?
                        <Text style={styles.errorText}>
                            Error creating new post
                        </Text>                    
                        :
                        <></>
                    }
                
                    <TouchableOpacity 
                        style={[
                            styles.postButton,
                            publishError? 
                                {
                                    borderColor: GatsbyStyles.gatsbyColours.red,
                                    borderWidth: 3,
                                    opacity: inputText? 1:0.5
                                }
                            :
                                {
                                    opacity: inputText? 1:0.5
                                }
                        ]} 
                        activeOpacity={0.4} 
                        onPress={isLoading? ()=>{} : inputText? publishPost : ()=>{}}
                        >
                            {isLoading?
                                <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                            :
                                <Text style={{
                                    fontSize: 22,
                                    fontWeight: '600',
                                    color: GatsbyStyles.gatsbyColours.white,
                                    alignSelf: 'center'
                                }}>
                                    Post
                                </Text>
                            }
                    </TouchableOpacity>
                </View>

            </Pressable>

        </View>
    )
}

/* Page Styles */
const styles = StyleSheet.create({
    newPostInputContainer:{
        width: '90%',
        bottom: 0,
        borderWidth: 3,
        borderRadius: 15,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: GatsbyStyles.gatsbyColours.white
    },
    textInput: {
        width: '90%',
        fontSize: 15,
        textAlignVertical: 'top',
    },
    imageUploadContainer:{
        width: '90%',
        height: 'auto',
        marginBottom: 10,
    },
    selectImageIcon:{
        width: '40%',
        height: 'auto',
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        padding: 5,
        borderRadius: 10,
        alignSelf: 'center'
    },
    deleteImageIcon:{
        width: 30, 
        height: 30,
        borderRadius: 30,
        position: 'absolute', 
        top: '0%', 
        right: '0%',
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#bbbbbb',
        opacity: 0.8,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        padding: 5,
    },
    postSubmissionContainer:{
        width: '90%',
        height: 'auto',
        alignSelf: 'center',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
    },
    postButton:{
        width: 100,
        height: 50,
        borderRadius: 60,
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        justifyContent: 'center',
        alignSelf: 'flex-end'
    },
    errorText: {
        color: GatsbyStyles.gatsbyColours.red,
        fontSize: 18,
        fontWeight: '600',
        margin: '5%',
        marginBottom: '0%'
    },
})
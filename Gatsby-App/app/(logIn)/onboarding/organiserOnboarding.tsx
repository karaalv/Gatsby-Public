/* Import utilities. */
import { 
    StyleSheet, View, Text, 
    TextInput, ScrollView, TouchableOpacity,
    Keyboard, Animated, Platform, 
    ActivityIndicator
} from 'react-native';
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';

/* Import Custom Components */
import BackNavigationButton from '../../../components/backNavigationButton';

/* Import Custom Styles */
import * as GatsbyStyles from '../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIREBASE_AUTH, FIRESTORE_STORAGE, FIRESTORE_DB } from '../../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from 'firebase/firestore';

/* Import Firebase Functions */
import { onboardOrganiserAccount } from '../../../scripts/GatsbyFirestoreFunctions';

// Callback to upload image to firebase.
async function uploadImage({imageURI, uid, context}){
    try{
        // Define upload path.
        const storageRef = ref(
            FIRESTORE_STORAGE, 
            `OrganiserAccounts/organiser_${uid}/${context}.jpg`
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
            // Save downloadable URL to user document.
            .then((snapshot) => {
                getDownloadURL(storageRef)
                    .then(async (url) => {
                        // User document.
                        const docRef = doc(FIRESTORE_DB, 'OrganiserAccounts', `organiser_${uid}`);
                        if(context === 'ProfileImage'){
                            await updateDoc(docRef, {
                                profileImage: url
                            })
                        } else {
                            await updateDoc(docRef, {
                                organiserLogo: url
                            })
                        }
                    })
            })

    } catch (error){
        console.log(`Error uploading image: ${error}`);
    }
}


/**
 * Onboarding page for Organiser Accounts.
 * @returns Organiser onboarding page.
 */
export default function OrganiserOnboarding(){
    // Hook for safe screen area.
    const insets = useSafeAreaInsets();

    // State management for scrollView.
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // State management for height offset.
    const [heightOffset, setHeightOffset] = useState(0);
    const translateY = useRef(new Animated.Value(0)).current;

    // State management for input fields.
    const [userName, setUserName] = useState<string>('');
    const [userNameFieldError, setUserNameFieldError] = useState<boolean>(false);
    const [userNameFieldErrorMessage, setUserNameFieldErrorMessage] = useState<string>('Please provide a username');

    const [email, setEmail] = useState<string>('');
    const [emailFieldError, setEmailFieldError] = useState<boolean>(false);
    const [emailFieldErrorMessage, setEmailFieldErrorMessage] = useState<string>('Please provide an Email');

    const [password, setPassword] = useState<string>('');
    const [passwordFieldError, setPasswordFieldError] = useState<boolean>(false);
    const [passwordFieldErrorMessage, setPasswordFieldErrorMessage] = useState<string>('Please enter a password');
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    // State management for loading.
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Offset animation.
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: - heightOffset,
            duration: 300,
            useNativeDriver: true
        }).start();

    }, [heightOffset])

    // Keyboard listener.
    Keyboard.addListener('keyboardWillHide', () => {
        setHeightOffset(0);
    })

    // Media state.
    const [containsOrganiserPhoto, setContainsOrganiserPhoto] = useState(false);
    const [selectedOrganiserPhoto, setOrganiserPhoto] = useState<string|null>(null);

    const [containsOrganiserLogo, setContainsOrganiserLogo] = useState(false);
    const [selectedOrganiserLogo, setOrganiserLogo] = useState<string|null>(null);

    const defaultProfileImageSource = require('../../../assets/Utilities/DefaultUserIcon_Large.png');
    const defaultLogoSource = require('../../../assets/Utilities/DefaultOrganiserLogo_Medium.png');

    const [defaultProfileIconURI, setDefaultProfileIconURI] = useState(null);
    const [defaultLogoURI, setDefaultLogoURI] = useState(null);

    // Fetch default profile image URI.
    useEffect(() => {
        const loadURI = async () => {
            const resolvedAsset = Asset.fromModule(defaultProfileImageSource);
            await resolvedAsset.downloadAsync();
            const uri = resolvedAsset.localUri || resolvedAsset.uri;
            setDefaultProfileIconURI(uri);
        }
        loadURI();
    }, [defaultProfileIconURI])

    // Fetch default logo URI.
    useEffect(() => {
        const loadURI = async () => {
            const resolvedAsset = Asset.fromModule(defaultLogoSource);
            await resolvedAsset.downloadAsync();
            const uri = resolvedAsset.localUri || resolvedAsset.uri;
            setDefaultLogoURI(uri);
        }
        loadURI();
    }, [defaultLogoURI])

    /**
     * Select media from device callback.
     */
    const chooseOrganiserPhoto = async () => {
        let media = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        })
        if(media.assets){
            setContainsOrganiserPhoto(true);
            setOrganiserPhoto(media.assets[0].uri);
        }
    }

    const chooseOrganiserLogo = async () => {
        let media = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        })
        if(media.assets){
            setContainsOrganiserLogo(true);
            setOrganiserLogo(media.assets[0].uri);
        }
    }

    /**
     * Deselect media from device callback.
     */
    const deselectOrganiserPhoto = async () => {
        if(selectedOrganiserPhoto != null){
            setContainsOrganiserPhoto(false);
            setOrganiserPhoto(null);
        }
    }

    const deselectOrganiserLogo = async () => {
        if(selectedOrganiserLogo != null){
            setContainsOrganiserLogo(false);
            setOrganiserLogo(null);
        }
    }

    /**
     * Sign up callback.
     */
    const signUpCallback = async () => {

        // Check values of input fields.
        if(userName === ''){
            setUserNameFieldError(true);
            setUserNameFieldErrorMessage('Please provide a username');
        } else {
            setUserNameFieldError(false);
        }
        //
        if(email === ''){
            setEmailFieldError(true);
            setEmailFieldErrorMessage('Please provide an Email');
        } else {
            setEmailFieldError(false);
        }
        //
        if(password === ''){
            setPasswordFieldError(true);
            setPasswordFieldErrorMessage('Please enter a password');
        } else {
            setPasswordFieldError(false);
        }

        // Create firebase user with input fields.
        if((userName !== '') && (email !== '') && (password !== '')){

            try{

                /* ONBOARDING */
                setIsLoading(true);

                // Register user with Auth.
                const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
                if(userCredential === null){
                    throw new Error(`User credentials null`);
                }

                // Upload organiser document.
                const onboard = await onboardOrganiserAccount({
                    accountID: userCredential.user.uid,
                    email: userCredential.user.email, 
                    username: userName, 
                });

                // Catch onboarding failure.
                if(onboard === null){
                    throw new Error(`Unable to fulfil onboarding`);
                }

                // Upload profile image.
                await uploadImage({
                    imageURI: containsOrganiserPhoto? selectedOrganiserPhoto : defaultProfileIconURI, 
                    uid: userCredential.user.uid,
                    context: 'ProfileImage'
                })

                // Upload logo.
                await uploadImage({
                    imageURI: containsOrganiserLogo? selectedOrganiserLogo : defaultLogoURI, 
                    uid: userCredential.user.uid,
                    context: 'OrganiserLogo'
                })

                /* NAVIGATE TO APP */
                router.replace('(app)/organiser/(home)/organiserHome');
    
            } catch (error: any){
                // Error handle from firebase response.
                switch(error.code){
                    // Email errors.
                    case 'auth/email-already-in-use':
                        setEmailFieldError(true);
                        setEmailFieldErrorMessage('Email already in use');
                        break;

                    case 'auth/invalid-email':
                        setEmailFieldError(true);
                        setEmailFieldErrorMessage('Invalid Email address');
                        break;

                    // Password errors.
                    case 'auth/weak-password':
                        setPasswordFieldError(true);
                        setPasswordFieldErrorMessage('Weak password, must be at least 6 characters');
                        break;

                    // Fallback error.
                    default: 
                        setUserNameFieldError(true);
                        setUserNameFieldErrorMessage('Unable to register account')
                }
                console.log(`Error creating user with Email and password: ${error}`);
                setIsLoading(false);
            }
        }
    }

    return(
        /**
         * Wrap screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flex: 1,
            backgroundColor: GatsbyStyles.gatsbyColours.white
        }}>

            {/* Screen Content */}

            {/* Top of screen  */}
            <View style={[styles.backLinkContainer, {opacity: isScrolling? 0.3:1}]}>
                {/* Back Button */}
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {/* Input fields */}
            <Animated.View style={{transform: Platform.OS === 'ios'? [{translateY}] : []}}>
                <ScrollView 
                    ref={scrollViewRef}
                    style={{height: '100%', width: '100%'}}
                    contentContainerStyle={{
                        paddingTop: '25%',
                        paddingBottom: '10%',
                        width: '100%'
                    }}
                    onScrollBeginDrag={() => {
                        setIsScrolling(true)
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="never">

                    {/* Title */}
                    <Text style={{
                        fontSize: 24, 
                        fontWeight: 'bold', 
                        alignSelf: 'flex-start',
                        margin: '7.5%', 
                        marginBottom: '1%'}}>
                        Create Organiser Account
                    </Text>

                    {/* Profile photo */}
                    <View style={styles.logInFieldContainer}>
                        <Text style={[GatsbyStyles.textStyles.mediumText, styles.loginFieldText]}>Edit Profile Photo:</Text>
                        
                        <TouchableOpacity style={{
                            width: 225, 
                            height: 'auto', 
                            alignSelf: 'center',
                            margin: '2%'}}
                            activeOpacity={0.4}
                            onPress={chooseOrganiserPhoto}>
                            <Image
                                source={
                                    containsOrganiserPhoto? 
                                        {uri: selectedOrganiserPhoto}
                                    :
                                        {uri: defaultProfileIconURI}
                                }
                                style={{
                                    height: 150, 
                                    width: 225, 
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    margin: '5%'
                                }}
                            />

                            <Image
                                source={require('../../../assets/Utilities/EditIcon.png')}
                                style={{
                                    height: 35, 
                                    width: 35, 
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    position: 'absolute',
                                    borderWidth: 2,
                                    borderRadius: 30,
                                    top: '-1%',
                                    right: '-5%',
                                    backgroundColor: GatsbyStyles.gatsbyColours.white,
                                    opacity: 0.8
                                }}
                            />
                        </TouchableOpacity>
                            
                        {/* Remove image option */}
                        { containsOrganiserPhoto ?
                            <TouchableOpacity style={{width: 'auto', height: 'auto', alignSelf: 'flex-end'}}
                                onPress={deselectOrganiserPhoto}>
                                <Text style={{
                                    color: GatsbyStyles.gatsbyColours.red,
                                    fontSize: 15,
                                    fontWeight: '600'
                                    }}>
                                    Remove Photo
                                </Text>
                            </TouchableOpacity>
                        :
                            <></>
                        }

                    </View>

                    {/* Logo */}
                    <View style={[styles.logInFieldContainer, {marginTop: '3%'}]}>
                        <Text style={[GatsbyStyles.textStyles.mediumText, styles.loginFieldText]}>Edit Organiser Logo:</Text>
                        
                        <TouchableOpacity style={{
                            width: 100, 
                            height: 'auto', 
                            alignSelf: 'center',
                            margin: '2%'}}
                            activeOpacity={0.4}
                            onPress={chooseOrganiserLogo}>
                            <Image
                                source={
                                    containsOrganiserLogo? 
                                        {uri: selectedOrganiserLogo}
                                    :
                                        {uri: defaultLogoURI}                                
                                }
                                style={{
                                    height: 100, 
                                    width: 100, 
                                    borderRadius: 10,
                                    borderWidth: 3,
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    margin: '5%'
                                }}
                            />

                            <Image
                                source={require('../../../assets/Utilities/EditIcon.png')}
                                style={{
                                    height: 35, 
                                    width: 35, 
                                    objectFit: 'contain',
                                    alignSelf: 'center',
                                    position: 'absolute',
                                    borderWidth: 2,
                                    borderRadius: 30,
                                    top: '-7.5%',
                                    right: '-7.5%',
                                    backgroundColor: GatsbyStyles.gatsbyColours.white,
                                    opacity: 0.8
                                }}
                            />
                        </TouchableOpacity>

                        { containsOrganiserLogo ?
                            <TouchableOpacity style={{width: 'auto', height: 'auto', alignSelf: 'flex-end'}}
                                onPress={deselectOrganiserLogo}>
                                <Text style={{
                                    color: GatsbyStyles.gatsbyColours.red,
                                    fontSize: 15,
                                    fontWeight: '600'
                                    }}>
                                    Remove Logo
                                </Text>
                            </TouchableOpacity>

                        :
                            <></>
                        }

                    </View>

                    {/* Username */}
                    <View style={[styles.logInFieldContainer, {marginTop: '2%'}]}>
                        <Text style={[GatsbyStyles.textStyles.mediumText, styles.loginFieldText]}>Username:</Text>
                        <TextInput
                            style={ userNameFieldError ?
                                [
                                    styles.textInputBox,
                                    {
                                        borderWidth: 2, 
                                        borderColor: GatsbyStyles.gatsbyColours.red,    
                                    }
                                ]
                            :
                                styles.textInputBox
                            }
                            onFocus={() => setHeightOffset(225)}
                            value={userName}
                            onChangeText={(input)=> setUserName(input)}
                        />
                        {/* Error text */}
                        { userNameFieldError? 
                            <Text style={styles.loginErrorText}>
                                {userNameFieldErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* E-mail */}
                    <View style={styles.logInFieldContainer}>
                        <Text style={[GatsbyStyles.textStyles.mediumText, styles.loginFieldText]}>Email:</Text>
                        <TextInput
                            style={ emailFieldError ?
                                [
                                    styles.textInputBox,
                                    {
                                        borderWidth: 2, 
                                        borderColor: GatsbyStyles.gatsbyColours.red,    
                                    }
                                ]
                            :
                                styles.textInputBox
                            }
                            onFocus={() => setHeightOffset(225)}
                            value={email}
                            onChangeText={(input)=> setEmail(input)}
                        />
                        {/* Error text */}
                        { emailFieldError? 
                            <Text style={styles.loginErrorText}>
                                {emailFieldErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Password */}
                    <View style={styles.logInFieldContainer}>
                        <Text style={[GatsbyStyles.textStyles.mediumText, styles.loginFieldText]}>Password:</Text>
                        <View style={[styles.passwordContainer, passwordFieldError? styles.errorField : {}]}>
                            <TextInput
                                secureTextEntry={!passwordVisibility}
                                style={{
                                    width: '87.5%',
                                    fontSize: 18,
                                    height: '100%'
                                }}
                                onFocus={() => setHeightOffset(200)}
                                value={password}
                                onChangeText={(input)=> setPassword(input)}
                            />
                            {/* Password visibility icon */}
                            <TouchableOpacity 
                                style={{
                                    alignSelf: 'center'
                                }} 
                                onPress={() => passwordVisibility? setPasswordVisibility(false) : setPasswordVisibility(true)}>
                                <Image
                                    source={
                                        !passwordVisibility?
                                            require('../../../assets/Utilities/EyeIcon_Open.png')
                                        :
                                            require('../../../assets/Utilities/EyeIcon_Closed.png')
                                    }
                                    style={{
                                        width: 40,
                                        height: 40,
                                        objectFit: 'contain',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Error text */}
                        { passwordFieldError? 
                            <Text style={styles.loginErrorText}>
                                {passwordFieldErrorMessage}
                            </Text>
                        :
                            <></>
                        }
                    </View>

                    {/* Sign up button */}
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={isLoading? ()=>{}:signUpCallback}
                        >
                        {isLoading?
                            <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                        :
                            <Text style={{
                                fontFamily: 'System', 
                                fontSize: 20, 
                                color: GatsbyStyles.gatsbyColours.white,
                                fontWeight: '700'
                                }}>
                                Sign up
                            </Text>
                        }
                    </TouchableOpacity>

                </ScrollView>
            </Animated.View>

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
    loginFieldText: {
        fontWeight: '700',
        margin: '4%'
    },
    logInFieldContainer: {
        width: '80%',
        height: 'auto',
        marginTop: '10%',
        alignSelf: 'center',
    },
    textInputBox: {
        height: 50, 
        width: '100%',
        fontSize: 18,
        padding: '3%',
        borderRadius: 25,
        backgroundColor: GatsbyStyles.gatsbyColours.grey
    },
    loginButton: {
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        marginTop: '20%',
        margin: '5%',
        alignSelf: 'flex-end',
        borderRadius: 25,
        width: 100, 
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginErrorText: {
        color: GatsbyStyles.gatsbyColours.red,
        fontSize: 15,
        fontWeight: '600',
        margin: '5%',
        marginBottom: '0%'
    },
    passwordContainer:{
        height: 50, 
        width: '100%',
        fontSize: 18,
        padding: '3%',
        borderRadius: 25,
        backgroundColor: GatsbyStyles.gatsbyColours.grey,
        flexDirection: 'row'
    },
    errorField:{
        borderWidth: 2, 
        borderColor: GatsbyStyles.gatsbyColours.red,    
    }
  });
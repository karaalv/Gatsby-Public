/* Import utilities. */
import { 
    StyleSheet, View, Text, 
    TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator 
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';

/* Import Custom Components */
import BackNavigationButton from '../../../components/backNavigationButton';

/* Import Custom Styles */
import * as GatsbyStyles from '../../../styles/gatsbyStyles';

/* Import Firebase Services */
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * Log In page for returning User or
 * Organiser accounts.
 * @returns Log In page.
 */
export default function LogIn(){

    // Hook for save screen area. 
    const insets = useSafeAreaInsets();

    // State management for input fields.
    const [email, setEmail] = useState<string>('');
    const [emailFieldError, setEmailFieldError] = useState<boolean>(false);
    const [emailFieldErrorMessage, setEmailFieldErrorMessage] = useState<string>('Please enter your Email');

    const [password, setPassword] = useState<string>('');
    const [passwordFieldError, setPasswordFieldError] = useState<boolean>(false);
    const [passwordFieldErrorMessage, setPasswordFieldErrorMessage] = useState<string>('Please enter your password');
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    // State management for loading.
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Log in callback.
     */
    const logInCallback = async () => {

        // Check values of input fields.
        if(email === ''){
            setEmailFieldError(true);
            setEmailFieldErrorMessage('Please enter your Email');
        } else {
            setEmailFieldError(false);
        }
        //
        if(password === ''){
            setPasswordFieldError(true);
            setPasswordFieldErrorMessage('Please enter your password');
        } else {
            setPasswordFieldError(false);
        }

        // Create firebase user with input fields.
        if((email !== '') && (password !== '')){

            try{

                setIsLoading(true);

                // Firebase create user, automatically signs in user.
                const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    
                if(userCredential === null){
                    throw new Error(`User credentials null`);
                }
    
            } catch (error: any){
                // Error handle from firebase response.
                switch(error.code){
                    // Error for invalid log in credential with
                    // Email enumeration enabled.
                    case 'auth/invalid-credential':
                        setPasswordFieldError(true);
                        setEmailFieldError(true);
                        setPasswordFieldErrorMessage('Invalid log in credentials');
                        setEmailFieldErrorMessage('Invalid log in credentials');
                        break;

                    // Email errors.
                    case 'auth/invalid-email':
                        setEmailFieldError(true);
                        setEmailFieldErrorMessage('Invalid Email address');
                        break;

                    // Password errors.
                    case 'auth/wrong-password':
                        setPasswordFieldError(true);
                        setPasswordFieldErrorMessage('Invalid password');
                        break;

                    // Fallback error.
                    default: 
                        setEmailFieldError(true);
                        setEmailFieldErrorMessage('Unable to log in')
                }
                console.log(`Error creating user with Email and password: ${error}`);
                setIsLoading(false);
            }
        }
    }

    return(
         /**
         * Wrap Screen content in inset wrapper.
         */
        <View style={{
            paddingLeft: insets.left,
            paddingRight: insets.right,
            flex: 1,
            backgroundColor: GatsbyStyles.gatsbyColours.white
        }}>
            {/* Screen Content */}

            {/* Top of screen  */}
            <View style={styles.backLinkContainer}>
                {/* Back Button */}
                <BackNavigationButton
                    onPress={() => router.back()}
                />
            </View>

            {/* Log in field */}
            <ScrollView 
                style={styles.container}
                contentContainerStyle={{paddingTop: '50%', paddingBottom: '10%'}}
                keyboardShouldPersistTaps='never'
                showsVerticalScrollIndicator={false}
                >
                    
                {/* Email Field */}
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

                {/* Password Field */}
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

                {/* Log In button */}
                <TouchableOpacity style={styles.loginButton} onPress={isLoading? ()=>{}:logInCallback}>
                {isLoading?
                            <ActivityIndicator size={'large'} color={GatsbyStyles.gatsbyColours.white}/>
                        :
                            <Text style={{
                                fontFamily: 'System', 
                                fontSize: 20, 
                                color: GatsbyStyles.gatsbyColours.white,
                                fontWeight: '700'
                                }}>
                                Log in
                            </Text>
                        }
                </TouchableOpacity>

            </ScrollView>

        </View>
        
    )
}

/* Page Styles */
const styles = StyleSheet.create({
    backLinkContainer: {
        position: 'absolute', 
        top: '7.5%', 
        left: '0%', 
        zIndex: 3
    },
    container: {
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0%'
    },
    loginFieldText: {
        fontWeight: '700',
        margin: '4%'
    },
    logInFieldContainer: {
        width: '80%',
        height: 'auto',
        marginTop: '15%',
        alignSelf: 'center'
    },
    textInputBox: {
        height: 50, 
        width: '100%',
        fontSize: 18,
        padding: '3%',
        borderRadius: 25,
        backgroundColor: GatsbyStyles.gatsbyColours.grey,
    },
    loginButton: {
        backgroundColor: GatsbyStyles.gatsbyColours.gold,
        margin: '5%',
        marginTop: '50%',
        alignSelf: 'flex-end',
        borderRadius: 25,
        width: 100, 
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
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
})
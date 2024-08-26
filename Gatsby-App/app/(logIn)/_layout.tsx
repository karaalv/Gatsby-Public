/* Import utilities. */
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

/* Session provider */
import { useAuthContext } from "../../utilities/sessionProvider";

/* Import Firebase Services */
import { FIRESTORE_DB } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

/**
 * Expo stack provider for onboarding pages.
 * This allows for onboarding screens to
 * be linked in a stack, more intuitive UI.
 * 
 * This layout also routes logged in users to
 * their home pages with the aid of the auth
 * context.
 * 
 * @returns Stack Provider Layout
 */
export default function OnboardingLayout(){
    // Deconstruct auth context.
    const { user } = useAuthContext();

    // User type used for routing.
    const [userType, setUserType] = useState<string | null>(null);

    useEffect(() => {
        // Evaluate user type callback.
        const evaluateUserType = async () => {
            if(user){
                const {uid} = user;
                console.log(`LogIn - context user: ${uid}`);
        
                // Retrieve user type from firestore.
                const userRef = doc(FIRESTORE_DB, 'UserAccounts', `user_${uid}`);
                const organiserRef = doc(FIRESTORE_DB, 'OrganiserAccounts', `organiser_${uid}`);

                const userResult = await getDoc(userRef);
                const organiserResult = await getDoc(organiserRef);

                // Set user type state.
                if(userResult.exists()){
                    setUserType('user');
                } 

                if (organiserResult.exists()){
                    setUserType('organiser');
                } 
            } else {
                console.log(`LogIn - context user: ${user}`);
                setUserType(null);
            }
        }

        evaluateUserType();
    }, [user])

    // If user logged in route to home page.
    if(userType === 'user'){
        console.log('route to user')
        return(
            <Redirect href={'(app)/user/(home)/userHome'}/>
        )
    } else if (userType === 'organiser'){
        console.log('route to organiser')
        return(
            <Redirect href={'(app)/organiser/(home)/organiserHome'}/>
        )
    } else {
        console.log('route to log in')
        return(
            <Stack>
                <Stack.Screen name='index' options={{
                    headerShown: false,
                }}/>
                <Stack.Screen name='onboarding/userOnboarding' options={{
                    headerShown: false
                }}/>
                <Stack.Screen name='onboarding/organiserOnboarding' options={{
                    headerShown: false
                }}/>
                <Stack.Screen name='onboarding/logIn' options={{
                    headerShown: false
                }}/>
            </Stack>
        );
    }

}


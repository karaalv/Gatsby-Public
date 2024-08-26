/* Import utilities. */
import { 
    createContext, useState, PropsWithChildren,
    useEffect, useContext 
} from "react";

/* Import Firebase Services */
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

/* Authentication context for application */

interface AuthContextProps {
    user: User | null;
    updateUser: (newUser: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

// Use auth context hook.
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if(context == null){
        throw new Error(`Must use Auth context in Auth Provider.`);
    }
    return context;
}

/**
 * This component wraps the application in a 
 * session provider for the user currently 
 * logged in on the device.
 * 
 * @returns Session provider.
 */
export default function SessionProvider({children}: PropsWithChildren){

    // Session state.
    const [currentUser, setCurrentUser] = useState(null);

    const updateUser = (newUser: User) => {
        setCurrentUser(newUser);
        console.log(`updated user to: ${JSON.stringify(currentUser)}`)
    }

    // Auth instance.
    const authInstance = getAuth();

    // Firebase Auth state listener.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            if(user !== null){
                setCurrentUser(user);
                console.log(`user logged in: ${user.uid}`);
            } else {
                setCurrentUser(null);
                console.log(`No one logged in user: ${JSON.stringify(currentUser)}`);
            }
        });

        return () => {
            unsubscribe();
        }

    }, [authInstance])

    return(
        <AuthContext.Provider value={{user: currentUser, updateUser: updateUser}}>
            {children}
        </AuthContext.Provider>
    )
}
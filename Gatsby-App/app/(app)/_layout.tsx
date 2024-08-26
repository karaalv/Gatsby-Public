/* Import utilities. */
import { Redirect, Slot} from "expo-router";

/* Session provider */
import { useAuthContext } from "../../utilities/sessionProvider";

/**
 * This layout uses the current auth context
 * to route logged out users to the login 
 * screen; otherwise relevant child screens
 * are loaded.
 * 
 * @returns App layout
 */
export default function AppLayout(){

    // Deconstruct auth context.
    const { user } = useAuthContext();

    if(user){
        const {uid} = user;
        console.log(`App - context user: ${uid}`);
    } else {
        console.log(`App - context user: ${user}`);
    }

    // If user not logged in route to log in page.
    if(user !== null){
        console.log('route to app')
        return(
            <>
                <Slot/>
            </>
        )
    } else {
        console.log('route to log in')
        return(
            <Redirect href={'/'}/>
        )
    }

}


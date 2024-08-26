/* Import utilities. */
import { Slot } from "expo-router";
import SessionProvider from "../utilities/sessionProvider";

/**
 * Defines root layout for the application.
 * @returns RootLayout.
 */
export default function RootLayout(){
    return(
        <SessionProvider>
            <Slot />
        </SessionProvider>
    )
}
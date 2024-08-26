/* Import utilities. */
import { Slot } from "expo-router";
import AccountTypeProvider from "../../../utilities/accountTypeProvider";

/**
 * Defines root layout for organiser scope.
 * @returns User scope layout.
 */
export default function OrganiserLayout(){

    return(
        <>
            <AccountTypeProvider accountType='organiser'>
                <Slot />
            </AccountTypeProvider>        
        </>
    );
}
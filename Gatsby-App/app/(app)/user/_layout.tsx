/* Import utilities. */
import { Slot } from "expo-router";
import AccountTypeProvider from "../../../utilities/accountTypeProvider";

/**
 * Defines root layout for user scope.
 * @returns User scope layout.
 */
export default function UserLayout(){
    return(
        <>
            <AccountTypeProvider accountType='user'>
                <Slot />
            </AccountTypeProvider>
        </>
    );
}
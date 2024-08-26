/* Import utilities. */
import { 
    createContext, useState, PropsWithChildren,
    useEffect, useContext 
} from "react";

// Account type context.
const AccountTypeContext = createContext<string | null>(null);

// Export context in hook,
export const useAccountTypeContext = () => {
    const context = useContext(AccountTypeContext);
    if(context == null){
        throw new Error(`Must use Account context in app Provider.`);
    }
    return context;
}

/**
 * Provides child components with the current
 * account type.
 * 
 * @returns Account Type Provider
 */
export default function AccountTypeProvider({children, accountType}: PropsWithChildren<{accountType: string}>){
    // Account type state.
    const [accountTypeContext] = useState(accountType);

    return(
        <AccountTypeContext.Provider value={accountTypeContext}>
            {children}
        </AccountTypeContext.Provider>
    )
}
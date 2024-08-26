/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout for ticket wallet page. 
 * @returns Stack Provider Layout
 */
export default function TicketWalletLayout(){
    return(
        <Stack>
            <Stack.Screen name='ticketWallet' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(ticketInfo)/ticketInfo' options={{
                headerShown: false
            }}/>
        </Stack>
    );
}
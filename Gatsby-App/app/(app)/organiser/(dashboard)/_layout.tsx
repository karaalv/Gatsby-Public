/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout.
 * @returns Stack Provider Layout
 */
export default function OrganiserDashboardLayout(){
    return(
        <Stack>
            <Stack.Screen name='eventDashboard' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(newEvent)/newEvent' options={{
                headerShown: false,                
            }}/>
            <Stack.Screen name='(eventDataPage)/eventDataPage' options={{
                headerShown: false,                
            }}/>
            <Stack.Screen name='(ticketValidation)/ticketValidation' options={{
                headerShown: false,                
            }}/>
        </Stack>
    );
}
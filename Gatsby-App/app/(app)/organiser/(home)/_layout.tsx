/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout for organiser home page. 
 * Allows user to navigate pages within home 
 * page scope.
 * @returns Stack Provider Layout
 */
export default function OrganiserHomeLayout(){
    return(
        <Stack>
            <Stack.Screen name='organiserHome' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='inbox' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(message)/message' options={{
                headerShown: false,                
            }}/>
        </Stack>
    );
}
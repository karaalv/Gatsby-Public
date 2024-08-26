/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout for organiser profile page. 
 * Allows user to navigate pages within home 
 * page scope.
 * @returns Stack Provider Layout
 */
export default function OrganiserProfileLayout(){
    return(
        <Stack>
            <Stack.Screen name='accountProfile' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(settings)/organiserSettings' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(newPost)/newPost' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(eventPage)/eventPage' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(eventList)/eventList' options={{
                headerShown: false
            }}/>
        </Stack>
    );
}
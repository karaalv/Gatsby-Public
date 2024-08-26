/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides root stack layout for explorable 
 * content. 
 * @returns Explore scope layout.
 */
export default function UserExploreLayout(){

    return(
        <Stack>
            <Stack.Screen name='explore' options={{
                headerShown: false
            }}/>
            {/* Messages in explore scope */}
            <Stack.Screen name='(message)/message' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(eventPage)/eventPage' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(userProfile)/userProfile' options={{
                headerShown: false
            }}/>
            {/* Nested organiser stack */}
            <Stack.Screen name='(organiserProfile)/organiserProfile' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(organiserProfile)/(eventPage)/eventPage' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(organiserProfile)/(eventList)/eventList' options={{
                headerShown: false
            }}/>
        </Stack>
    );
}
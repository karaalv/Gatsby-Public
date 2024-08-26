/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout for user home page. 
 * Allows user to navigate pages within home 
 * page scope.
 * @returns Stack Provider Layout
 */
export default function UserHomeLayout(){
    return(
        <Stack>
            <Stack.Screen name='userHome' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='inbox' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(message)/message' options={{
                headerShown: false,                
            }}/>
            <Stack.Screen name='(userProfile)/userProfile' options={{
                headerShown: false,                
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
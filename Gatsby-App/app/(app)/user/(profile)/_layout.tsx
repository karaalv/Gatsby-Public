/* Import utilities. */
import { Stack } from "expo-router";

/**
 * Provides stack layout for user profile page. 
 * Allows user to navigate pages within home 
 * page scope.
 * @returns Stack Provider Layout
 */
export default function UserProfileLayout(){
    return(
        <Stack>
            <Stack.Screen name='accountProfile' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(settings)/userSettings' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(newPost)/newPost' options={{
                headerShown: false
            }}/>
        </Stack>
    );
}
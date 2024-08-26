/* Import utilities. */
import { useLocalSearchParams } from "expo-router";

// Use Organiser Profile Component to render screen.
import OrganiserProfileComponent from "../../../../../pages/organiserProfileComponent"

/**
 * @returns Organiser Profile - Home scope.
 */
export default function OrganiserProfile(){
    // Hook for event details.
    const { accountID } = useLocalSearchParams();

    return(
        <OrganiserProfileComponent
            accountID={`${accountID}`}
            rootPath='home'
            accountScope='user'
        />
    )
}
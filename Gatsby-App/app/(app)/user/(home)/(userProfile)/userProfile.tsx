/* Import utilities. */
import { useLocalSearchParams} from "expo-router";

// Use User Profile Component to render screen.
import UserProfileComponent from "../../../../../pages/userProfileComponent";

/**
 * @returns User Profile - Home scope.
 */
export default function UserProfile(){
    // Hook for event details.
    const { accountID } = useLocalSearchParams();

    return(
        <UserProfileComponent
            accountID={`${accountID}`}
            rootPath='home'
            accountScope='user'
        />
    )
}
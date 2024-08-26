/* Import utilities */
import { useLocalSearchParams } from "expo-router";

// Use Event List Component to render screen.
import EventListComponent from "../../../../../pages/eventListComponent";

/**
 * @returns Event list - Explore scope.
 */
export default function EventList(){
    const { accountID } = useLocalSearchParams();
    
    return(
        <EventListComponent
            rootPath='profile'
            accountScope='organiser'
            accountID={`${accountID}`}
        />
    )
}

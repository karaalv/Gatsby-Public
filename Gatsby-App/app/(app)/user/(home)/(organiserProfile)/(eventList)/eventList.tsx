/* Import utilities */
import { useLocalSearchParams } from "expo-router";

// Use Event List Component to render screen.
import EventListComponent from "../../../../../../pages/eventListComponent";

/**
 * @returns Event list - Home scope.
 */
export default function EventList(){
    const { accountID } = useLocalSearchParams();

    return(
        <EventListComponent
            rootPath='home'
            accountScope='user'
            accountID={`${accountID}`}
        />
    )
}

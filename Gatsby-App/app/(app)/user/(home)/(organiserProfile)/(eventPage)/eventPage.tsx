/* Import utilities */
import { useLocalSearchParams, router} from "expo-router";

/* Import custom components */
import EventPageComponent from "../../../../../../pages/eventPageComponent";

/**
 * @returns Event Page - Home scope.
 */
export default function OrganiserEventPage(){

    // Hook for event details.
    const { eventID, createdBy } = useLocalSearchParams();

    // Define navigation route.
    const organiserRoute = () => router.push({
        pathname: '(app)/user/(home)/(organiserProfile)/organiserProfile',
        params: {accountID: createdBy}
    });

    return(
        <EventPageComponent
            accountScope='user'
            eventID={`${eventID}`}
            createdBy={`${createdBy}`}
            organiserRoute={organiserRoute}
        />
    )
}
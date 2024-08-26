/* Import utilities */
import { router, useLocalSearchParams } from "expo-router";

/* Import custom components */
import EventPageComponent from "../../../../../../pages/eventPageComponent";

/**
 * @returns Event Page - Explore scope.
 */
export default function ExploreEventPage(){
    // Hook for event details.
    const { eventID, createdBy } = useLocalSearchParams();

    // Define navigation route.
    const organiserRoute = () => router.push({
        pathname: '(app)/organiser/(explore)/(organiserProfile)/organiserProfile',
        params: {accountID: createdBy}
    });
    
    return(
        <EventPageComponent
            accountScope='organiser'
            eventID={`${eventID}`}
            createdBy={`${createdBy}`}
            organiserRoute={organiserRoute}
        />
    )
}
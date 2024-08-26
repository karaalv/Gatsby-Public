/* Import utilities */
import { router, useLocalSearchParams } from "expo-router";

/* Import custom components */
import EventPageComponent from "../../../../../pages/eventPageComponent";

/**
 * @returns Event Page - Organiser profile scope.
 */
export default function ProfileEventPage(){
    // Hook for event details.
    const { eventID, createdBy } = useLocalSearchParams();

    // Define navigation route.
    const organiserRoute = () => router.push({
        pathname: '(app)/organiser/(profile)/accountProfile',
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
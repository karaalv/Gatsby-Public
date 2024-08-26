/* Import utilities. */

// Use inbox component.
import InboxPageComponent from "../../../../pages/inboxPageComponent";

/**
 * @returns Inbox page.
 */
export default function Inbox(){
    return(
        <InboxPageComponent
            accountScope='user'
        />
    )
}
/* Import utilities. */

// Use modularised component.
import NewPostComponent from "../../../../../pages/newPostComponent";

/**
 * @returns New post UI.
 */
export default function NewPost(){
    return(
        <NewPostComponent
            context='organiser'
        />
    )
}
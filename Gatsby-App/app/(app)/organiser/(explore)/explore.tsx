/* Import utilities. */

// Use modularised explore page.
import ExplorePageComponent from "../../../../pages/explorePageComponent"

/**
 * @returns Explore page.
 */
export default function Explore(){
    return(
        <ExplorePageComponent
            accountScope='organiser'
        />
    )
}
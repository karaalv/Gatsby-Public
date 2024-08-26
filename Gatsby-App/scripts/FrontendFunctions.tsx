/**
 * This file contains callbacks functions necessary for 
 * rendering different UI components throughout the 
 * application.  
 */

/* Import utilities. */
import { 
    View,
    Text
} from "react-native";
import { Image } from "expo-image";

/* Import Custom Styles */
import * as GatsbyStyles from '../styles/gatsbyStyles';

/* Import Custom Components */
import PostComponent from "../components/postComponent";
import EventCard from "../components/eventCard";
import TicketBox from "../components/ticketBox";
import EventDataCard from "../components/eventDataCard";

/* Import Component Types */
import { 
    PostComponentProps,
    EventCardProps,
    TicketBoxProps,
    EventDataCardProps,  
} from "../types/UiComponentTypes";

/* Import Firestore Types */
import { EventDocument } from "../types/GatsbyFirestoreTypes";

/*** RENDER POST CALLBACK ***/

// Type.
type renderPostArgs = {
    item: PostComponentProps;
    routerCallback: () => void | null;
}

export function renderPost({item, routerCallback}: renderPostArgs){
    return(
        <View key={item.postID} style={{marginBottom: '10%'}}>
            <PostComponent
                createdBy={item.createdBy}
                username={item.username}
                context={item.context}
                profileImage={item.profileImage}
                containsMedia={item.containsMedia}
                mediaImage={item.mediaImage}
                content={item.content}
                contentHeight={item.contentHeight}
                routerCallback={routerCallback}
                likes={item.likes}
                postID={item.postID}
            />
        </View>
    )
}

/*** RENDER EVENT CARD CALLBACK ***/

// Type.
type renderEventCardArgs = {
    item: EventCardProps,
    routerCallback: () => void | null;
}

// Vertical.
export function renderEventCard({item, routerCallback}: renderEventCardArgs){
    return(
        <View key={item.id} style={{marginBottom: '7.5%'}}>
            <EventCard
                createdBy={item.createdBy}
                eventName={item.eventName}
                eventDate={item.eventDate}
                eventCountry={item.eventCountry}
                eventCity={item.eventCity}
                eventBanner={item.eventBanner}
                OrganiserLogo={item.OrganiserLogo}
                numberOfOthers={item.numberOfOthers}
                attendees={item.attendees}
                routerCallback={routerCallback}
                id={item.id}
            />
        </View>
    )
}

/* Render event card from document */
type renderEventCardFromDocArgs = {
    item: EventDocument,
    routerCallback: () => void | null;
}

export function renderEventCardFromDoc({item, routerCallback}: renderEventCardFromDocArgs){
    return(
        <View key={item.eventID} style={{marginBottom: '7.5%'}}>
            <EventCard
                createdBy={item.createdBy}
                eventName={item.eventName}
                eventDate={item.eventDate}
                eventCountry={item.eventCountry}
                eventCity={item.eventCity}
                eventBanner={item.eventBanner}
                OrganiserLogo={''}
                numberOfOthers={item.numberOfOthers}
                attendees={item.attendees}
                routerCallback={routerCallback}
                id={item.eventID}
            />
        </View>
    )
}

// Horizontal.
export function renderEventCardHorizontal({item, routerCallback}: renderEventCardArgs){
    return(
        <View key={item.id} style={{margin: 5}}>
            <EventCard
                createdBy={item.createdBy}
                eventName={item.eventName}
                eventDate={item.eventDate}
                eventCountry={item.eventCountry}
                eventCity={item.eventCity}
                eventBanner={item.eventBanner}
                OrganiserLogo={item.OrganiserLogo}
                numberOfOthers={item.numberOfOthers}
                attendees={item.attendees}
                routerCallback={routerCallback}
                id={item.id}
            />
        </View>
    )
}

/* Render Event Data Card */
type renderEventDataCardArgs = {
    item: EventDataCardProps;
}

export function renderEventDataCard({item}: renderEventDataCardArgs){
    return(
        <View key={item.eventID} style={{marginBottom: '7.5%'}}>
            <EventDataCard
                eventName={item.eventName}
                eventDate={item.eventDate}
                eventBanner={item.eventBanner}
                organiserLogo={''}
                revenue={item.revenue}
                ticketsSold={item.ticketsSold}
                ticketPrice={item.ticketPrice}
                tag={item.tag}
                eventID={item.eventID}
                currencyCode={item.currencyCode}
            />
        </View>
    )
}

/*** RENDER TICKET BOX ***/
// Type.
type renderTicketBoxArgs = {
    item: TicketBoxProps
}

export function renderTicketBox({item}: renderTicketBoxArgs){
    return(
        <View key={item.id} style={{alignSelf: 'center', marginBottom: '10%'}}>
            <TicketBox
                ticketID={item.ticketID}
                eventID={item.eventID}
                organiserID={item.organiserID}
                id={item.ticketID}
            />
        </View>
    )
}

/*** NETWORK/LOADING ERRORS ***/

export function renderLoadingError(){
    return(
        <View style={{
            flexDirection: 'row', 
            position: 'absolute',
            top: '50%',
            alignSelf: 'center',
            alignItems: 'center',
            }}>
            <Image
                source={require('../assets/Utilities/ErrorIcon.png')}
                style={{
                    width: 30,
                    height: 30,
                    objectFit: 'contain',
                    tintColor: GatsbyStyles.gatsbyColours.red
                }}
            />
            <Text style={{
                fontSize: 20, 
                fontWeight: '700',
                color: GatsbyStyles.gatsbyColours.red,
                marginLeft: '10%'
            }}>
                Network error 
            </Text>
        </View>
    )
}
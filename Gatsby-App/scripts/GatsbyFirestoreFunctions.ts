/**
 * This file contains functions used to
 * manage firestore interactions throughout 
 * the application.
 */

/* Import utilities. */
import { FIRESTORE_DB, FIRESTORE_STORAGE } from "../firebaseConfig";

/* Import Firebase Services */
import { 
    doc, 
    setDoc, 
    updateDoc, 
    getDoc,
    Timestamp, 
    DocumentReference,
    collection, 
    CollectionReference,
    getDocs, 
    increment,
    limit,
    query,
    arrayUnion,
    arrayRemove,
    where,
    addDoc,
    deleteDoc
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* Import API functions  */
import { 
    generateNewEventIDAndKey, 
    mintTicket,
    validateTicketAPIRequest
} from "./BackendFunctions";

/* Import UI Component Types */
import { 
    PostComponentItemProps, 
    PostComponentProps,
    EventCardItemProps, 
    EventCardProps,
    EventDataCardProps,
    TicketBoxProps,
    MessageProps,
    InboxCardProps,
} from "../types/UiComponentTypes";

/* Import Gatsby Firestore types. */
import { 
    OrganiserAccountDocument, 
    UserAccountDocument,
    PostDocument, 
    EventDocument, 
    AccountInfo,
    TicketDocument,
    MessageDocument,
    InboxDocument,
    ValidationRequest,
    OrganiserAnalytics
} from "../types/GatsbyFirestoreTypes";

/* Import Firestore function types. */
import { 
    OnboardingArgs, 
    NewPostArgs, 
    NewEventArgs, 
    PullAccountPostArgs,
    PullAccountInfoArgs,
    LikeUnlikePostArgs,
    PullEventCardsArgs,
    PullEventArgs,
    PurchaseTicketArgs,
    AddAccountToEventAttendeesArgs,
    PullTicketsArgs,
    FollowUnfollowAccountArgs,
    IsFollowingArgs,
    IsPostLikedArgs,
    PushMessageArgs,
    PullMessagesArgs,
    PullInboxArgs,
    PullAccountEventDataCardsArgs,
    PullEventDataArgs,
    CreateValidationRequestArgs,
    RemoveValidationRequestArgs,
    ValidateTicketArgs,
    PullTicketArgs
} from "../types/FirestoreFunctionTypes";

/*** ONBOARDING FUNCTIONS ***/

/**
 * Creates Firestore document for user
 * account during onboarding.
 * 
 * @param {OnboardingArgs}
 * @returns {Promise<void | null>}
 */
export async function onboardUserAccount({accountID, email, username}: OnboardingArgs): Promise<void | null>{
    // Set document name.
    const documentName = `user_${accountID}`;

    // Create user document with input data.
    const UserDocument: UserAccountDocument = {
        // Account information.
        accountID: accountID,
        accountType: 'user',
        username: username,
        email: email,
        // Images.
        profileImage: null,
        // Array Information.
        following: [],
        likedPosts: [],
        chats: [],
        // Sub-collections.
        postsSubCollection: [],
        ticketsSubCollection: [],
    }

    try{

        // Define database reference.
        const documentRef = doc(FIRESTORE_DB, 'UserAccounts', documentName);

        // Push document to firestore.
        await setDoc(documentRef, UserDocument);
        
    } catch (error) {
        console.log(`Error onboarding user: ${error}`);
        return null;
    }

}

/**
 * Creates Firestore document for organiser
 * account during onboarding.
 * 
 * @param {OnboardingArgs}
 * @returns {Promise<void | null>} 
 */
export async function onboardOrganiserAccount({accountID, email, username}: OnboardingArgs): Promise<void | null>{
    // Set document name.
    const documentName = `organiser_${accountID}`;

    // Create organiser document with input data.
    const organiserDocument: OrganiserAccountDocument = {
        // Account information.
        accountID: accountID,
        accountType: 'organiser',
        username: username,
        email: email,
        // Images.
        profileImage: null,
        organiserLogo: null,
        // Array information.
        following: [], 
        likedPosts: [], 
        chats: [],      
        // Sub-collections.
        postsSubCollection: [],
        eventsSubCollection: [],
    }

    try{

        // Define database reference.
        const documentRef = doc(FIRESTORE_DB, 'OrganiserAccounts', documentName);

        // Push document to firestore.
        await setDoc(documentRef, organiserDocument);
        
    } catch (error) {
        console.log(`Error onboarding organiser: ${error}`);
        return null
    }
}


/*** POST FUNCTIONS ***/

/**
 * Pushes new post document to firestore.
 * In the event of an error null is returned
 * to handle corresponding UI.
 * 
 * @param {NewPostArgs} 
 * @returns {Promise<string|null>}
 */
export async function pushNewPost({accountID, context, content, contentHeight}: NewPostArgs): Promise<string | null>{
    try{
        let accountRef: CollectionReference;
        let postDocRef: DocumentReference;
        
        /**
         * Generate post ID with account ID and post
         * document index in sub collection. 
         */
        if(context === 'user'){
            accountRef = collection(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${accountID}`, 
                'postsSubCollection'
            );
        } else {
            accountRef = collection(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${accountID}`, 
                'postsSubCollection'
            );
        }

        const docSnap = await getDocs(accountRef);

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        const postIndex = `${docSnap.size}`;
        const postID = `${accountID}_post[${postIndex}]`;

        // Set document reference.
        if(context === 'user'){
            postDocRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${accountID}`, 
                'postsSubCollection', 
                postID
            );
        } else {
            postDocRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${accountID}`, 
                'postsSubCollection', 
                postID
            );
        }

        // Create new post document with the following data.
        const newPostDocument: PostDocument = {
            // Post information.
            postID: postID,
            createdBy: accountID,
            accountType: context,
            timestamp: Timestamp.now(),
            content: content,
            contentHeight: contentHeight,
            likes: 0,
            // Media.
            media: null
        }

        const postDB = doc(FIRESTORE_DB, 'PostsDB', postID);

        // Push to firestore.
        await setDoc(postDocRef, newPostDocument);
        await setDoc(postDB, newPostDocument);

        return postID;
    
    } catch(error){
        console.log(`Error pushing new post to database: ${error}`);
        return null;
    }
}

/**
 * Pulls all posts from a single account, data
 * from firestore is destructured and returned 
 * in suitable type for UI.
 * 
 * Username and profile photo are rendered within
 * post component. 
 *  
 * @param {PullAccountPostArgs} 
 * @returns {Promise<PostComponentProps[] | null>}
 */
export async function pullAccountPosts({accountID, context}: PullAccountPostArgs): Promise<PostComponentProps[] | null>{
    try{
        // Get reference to account posts sub collection.
        let postsSubCollectionRef: CollectionReference;
        if(context === 'user'){
            postsSubCollectionRef = collection(
                FIRESTORE_DB,
                'UserAccounts',
                `user_${accountID}`,
                'postsSubCollection'
            );
        } else {
            postsSubCollectionRef = collection(
                FIRESTORE_DB,
                'OrganiserAccounts',
                `organiser_${accountID}`,
                'postsSubCollection'
            );
        }

        // Get document data.
        const docsSnap = await getDocs(postsSubCollectionRef);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const postData: PostComponentProps[] = [];

        // Destructure document data.
        docsSnap.docs.forEach((document: any) => {
            const {
                postID, 
                createdBy, 
                accountType, 
                timestamp, 
                content, 
                contentHeight, 
                likes, 
                media 
            } = document.data();

            let data: PostComponentProps = {
                createdBy: createdBy,
                context: accountType,
                username: '',
                profileImage: '',
                containsMedia: media? true : false,
                mediaImage: media? media : null,
                contentHeight: contentHeight,
                content: content,
                postID: postID,
                likes: likes,
                routerCallback: null
            }

            // Push structured data to array.
            postData.push(data);
        })

        // Return post component array.
        return postData.reverse();

    } catch (error) {
        console.log(`Error pulling account posts: ${error}`);
        return null;
    }

}

/**
 * Pulls 15 most recent publicly explorable 
 * posts on the application from the 'posts 
 * database'.
 * 
 * @returns {Promise<PostComponentProps[] | null>}
 */
export async function pullPublicPosts(): Promise<PostComponentProps[] | null>{
    try{
        // Get reference to public posts collection.
        const postDBRef = collection(
            FIRESTORE_DB, 
            'PostsDB'
        )

        const postDBQuery = query(postDBRef, limit(15));

        // Get document data.
        const docsSnap = await getDocs(postDBQuery);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const postData: PostComponentProps[] = [];

        // Destructure document data.
        docsSnap.docs.forEach((document: any) => {
            const {
                postID, 
                createdBy, 
                accountType, 
                timestamp, 
                content, 
                contentHeight, 
                likes, 
                media 
            } = document.data();

            let data: PostComponentProps = {
                createdBy: createdBy,
                context: accountType,
                username: '',
                profileImage: '',
                containsMedia: media? true : false,
                mediaImage: media? media : null,
                contentHeight: contentHeight,
                content: content,
                postID: postID,
                likes: likes,
                routerCallback: null
            }

            // Push structured data to array.
            postData.push(data);
        })

        // Return post component array.
        return postData.reverse();

    } catch (error) {
        console.log(`Error pulling public posts: ${error}`);
        return null; 
    }
}

/**
 * Increments or decrements the like number for 
 * a specified post throughout the application.
 *    
 * @param {LikeUnlikePostArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function likeUnlikePost({
    postID, 
    createdBy, 
    accountType, 
    isLiking, 
    accountLikingID, 
    accountLikingType
}: LikeUnlikePostArgs): Promise<boolean | null>{
    try{
        // Get reference to post.
        let postsSubCollectionRef: DocumentReference;
        if(accountType === 'user'){
            postsSubCollectionRef = doc(
                FIRESTORE_DB,
                'UserAccounts',
                `user_${createdBy}`,
                'postsSubCollection',
                postID
            );
        } else {
            postsSubCollectionRef = doc(
                FIRESTORE_DB,
                'OrganiserAccounts',
                `organiser_${createdBy}`,
                'postsSubCollection',
                postID
            );
        }

        // Reference to post in 'database'.
        const postDBRef = doc(
            FIRESTORE_DB,
            'PostsDB',
            postID
        )

        // Reference to account liking post.
        let accountLikingRef: DocumentReference
        if(accountLikingType === 'user'){
            accountLikingRef = doc(
                FIRESTORE_DB,
                'UserAccounts',
                `user_${accountLikingID}`,
            );
        } else {
            accountLikingRef = doc(
                FIRESTORE_DB,
                'OrganiserAccounts',
                `organiser_${accountLikingID}`,
            );
        }

        if(isLiking){
            // Increment like count.
            await updateDoc(postsSubCollectionRef, {
                likes: increment(1)
            })
            //
            await updateDoc(postDBRef, {
                likes: increment(1)
            })

            // Save to account liked array.
            await updateDoc(accountLikingRef,{
                likedPosts: arrayUnion(postID)
            })

        } else {
            // Decrement like count.
            await updateDoc(postsSubCollectionRef, {
                likes: increment(-1)
            })
            //
            await updateDoc(postDBRef, {
                likes: increment(-1)
            })

            // Remove from account liked array.
            await updateDoc(accountLikingRef,{
                likedPosts: arrayRemove(postID)
            })
        }

        return true;

    } catch(error) {
        console.log(`Error liking account post: ${error}`);
        return null;
    }
}

/**
 * Used to check if an account has liked a post
 * of a given post ID.
 * 
 * @param {IsPostLikedArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function isPostLiked({postID, accountID, accountType}: IsPostLikedArgs): Promise<boolean | null>{
    try{
        // Get follower account ref.
        let accountRef: DocumentReference;
        if(accountType === 'user'){
            accountRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${accountID}`,
            );
        } else {
            accountRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${accountID}`, 
            );
        }

        // Check with query.
        const docSnap = await getDoc(accountRef);

        if(docSnap === null || undefined){
            throw new Error("Nullish following array");
        }

        const {likedPosts} = docSnap.data();

        // Check if following.
        if(likedPosts.includes(postID)){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(`Error checking if post liked: ${error}`);
        return null;
    }
}


/*** EVENT FUNCTIONS ***/

/**
 * Pushes new event document to firestore.
 * In the event of an error null is returned
 * to handle corresponding UI.
 * 
 * Function makes call to client API for the
 * generation of eventID and corresponding 
 * eventKey.
 * 
 * @param {NewEventArgs} 
 * @returns {Promise<string | null>}
 */
export async function pushNewEvent({
    accountID, eventName, 
    eventDate, eventCountry, 
    eventCity, eventDescription, 
    ticketPrice, currencyCode}: NewEventArgs): Promise<string | null>{
        
    try{
        // Generate eventID and eventKey with asymmetric cryptography
        // with call to client API.
        const response = await generateNewEventIDAndKey();

        if(response === null){
            throw new Error("Null API function call.");
        }

        const eventID = response.eventID;
        const eventKey = response.eventKey;

        // Create new event with the following data.
        const newEventDocument: EventDocument = {
            // Event information.
            eventID: eventID,
            eventKey: eventKey,
            createdBy: accountID,
            Timestamp: Timestamp.now(),
            eventName: eventName,
            eventDate: eventDate,
            eventCountry: eventCountry,
            eventCity: eventCity,
            eventDescription: eventDescription,
            ticketPrice: ticketPrice,
            currencyCode: currencyCode,
            numberOfOthers: 0,
            // Analytics.
            ticketsSold: 0,
            revenue: 0,
            // Images.
            eventBanner:null,
            // Attendees.
            attendees: []
        }

        const eventSubCollRef = doc(
            FIRESTORE_DB, 
            'OrganiserAccounts', 
            `organiser_${accountID}`, 
            'eventsSubCollection', 
            `event_${eventID}`
        );

        const eventDB = doc(
            FIRESTORE_DB, 
            'EventsDB', 
            `event_${eventID}`
        );

        // Push to firestore.
        await setDoc(eventSubCollRef, newEventDocument);
        await setDoc(eventDB, newEventDocument);

        return eventID;

    } catch (error) {
        console.log(`Error pushing new event to database: ${error}`);
        return null;
    }
}

/**
 * Pulls all event documents for a specified organiser 
 * account.
 * 
 * @param {PullEventCardsArgs} 
 * @returns {Promise<EventCardProps[] | null>}
 */
export async function pullAccountEventCards({accountID}: PullEventCardsArgs): Promise<EventCardProps[] | null>{
    try{
        // Get reference to event posts sub collection.
        const eventsSubCollectionRef = collection(
            FIRESTORE_DB,
            'OrganiserAccounts',
            `organiser_${accountID}`,
            'eventsSubCollection'
        );

        // Get document data.
        const docsSnap = await getDocs(eventsSubCollectionRef);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const eventCards: EventCardProps[] = [];

        // Destructure document data.
        docsSnap.docs.forEach((document: any) => {
            const {
                eventID,
                createdBy,
                eventName,
                eventDate,
                eventCountry,
                eventCity,
                eventDescription,
                ticketPrice,
                currencyCode,
                numberOfOthers,
                eventBanner,
                attendees
            } = document.data();

            let data: EventCardProps = {
                createdBy: createdBy,
                eventName: eventName,
                eventDate: eventDate,
                eventCountry: eventCountry,
                eventCity: eventCity,
                eventBanner: eventBanner,
                OrganiserLogo: null,
                numberOfOthers: numberOfOthers,
                routerCallback: null,
                attendees: attendees,
                id: eventID
            }

            // Push structured data to array.
            eventCards.push(data);
        })

        // Return post component array.
        return eventCards.reverse();

    } catch (error) {
        console.log(`Error pulling account events: ${error}`);
        return null;
    }
}

/**
 * Pulls event data cards for organiser 
 * account.
 * 
 * @param {PullAccountEventDataCardsArgs} 
 * @returns {Promise<EventDataCardProps[] | null>}
 */
export async function pullAccountEventDataCards({accountID}: PullAccountEventDataCardsArgs): Promise<EventDataCardProps[] | null>{
    try{
        // Get reference to event posts sub collection.
        const eventsSubCollectionRef = collection(
            FIRESTORE_DB,
            'OrganiserAccounts',
            `organiser_${accountID}`,
            'eventsSubCollection'
        );

        // Get document data.
        const docsSnap = await getDocs(eventsSubCollectionRef);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const eventDataCards: EventDataCardProps[] = [];

        // Destructure document data.
        docsSnap.docs.forEach((document: any) => {
            const {
                eventID,
                createdBy,
                eventName,
                eventDate,
                eventCountry,
                eventCity,
                eventDescription,
                ticketPrice,
                currencyCode,
                numberOfOthers,
                eventBanner,
                attendees
            } = document.data();

            const ticketsSold = attendees.length;
            let randomTag: string;
            if(Math.random() > 0.5){
                randomTag = 'live';
            } else {
                if(Math.random()){
                    randomTag = 'upcoming';
                } else {
                    randomTag = 'passed';
                }
            }

            let data: EventDataCardProps = {
                eventID: eventID,
                eventName: eventName,
                eventDate: eventDate,
                eventBanner: eventBanner,
                revenue: ticketPrice * ticketsSold,
                ticketsSold: ticketsSold,
                ticketPrice: ticketPrice,
                currencyCode: currencyCode,
                tag: randomTag,
                organiserLogo: '',
            }

            // Push structured data to array.
            eventDataCards.push(data);
        })

        // Return post component array.
        return eventDataCards.reverse();

    } catch (error) {
        console.log(`Error pulling account event data cards: ${error}`);
        return null;
    }
}

/**
 * Pulls event data for a specified organiser 
 * event.
 * 
 * @param {PullEventDataArgs} 
 * @returns {Promise<EventDocument | null>}
 */
export async function pullEventData({eventIDArg, accountID}: PullEventDataArgs): Promise<EventDocument | null>{
    try{
        // Get reference to event posts sub collection.
        const eventsSubCollectionRef = doc(
            FIRESTORE_DB,
            'OrganiserAccounts',
            `organiser_${accountID}`,
            'eventsSubCollection',
            `event_${eventIDArg}`
        );

        // Get document data.
        const docSnap = await getDoc(eventsSubCollectionRef);

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Destructure document.
        const {
            // Event information.
            eventID,
            eventKey,
            createdBy,
            Timestamp,
            eventName,
            eventDate,
            eventCountry,
            eventCity,
            eventDescription,
            ticketPrice,
            currencyCode,
            numberOfOthers,
            // Analytics.
            ticketsSold,
            revenue,
            // Images.
            eventBanner,
            // Attendees.
            attendees,
        } = docSnap.data();

        const data: EventDocument = {
            eventID: eventID,
            eventKey: eventKey,
            createdBy: createdBy,
            Timestamp: Timestamp,
            eventName: eventName,
            eventDate: eventDate,
            eventCountry: eventCountry,
            eventCity: eventCity,
            eventDescription: eventDescription,
            ticketPrice: ticketPrice,
            currencyCode: currencyCode,
            numberOfOthers: numberOfOthers,
            ticketsSold: ticketsSold,
            revenue: ticketPrice * ticketsSold,
            eventBanner: eventBanner,
            attendees: attendees
        }

        return data;
        
    } catch (error) {
        console.log(`Error pulling event data: ${error}`);
        return null;
    }
}

/**
 * Pulls 15 most recent publicly explorable 
 * events on the application from the 'events 
 * database'.
 * 
 * @returns {Promise<EventCardProps[] | null>}
 */
export async function pullPublicEvents(): Promise<EventCardProps[] | null>{
    try{
        // Get reference to public posts collection.
        const eventDBRef = collection(
            FIRESTORE_DB, 
            'EventsDB'
        )

        const eventDBQuery = query(eventDBRef, limit(15));

        // Get document data.
        const docsSnap = await getDocs(eventDBQuery);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const eventData: EventCardProps[] = [];

        // Destructure document data.
        docsSnap.docs.forEach((document: any) => {
            const {
                eventID,
                createdBy,
                eventName,
                eventDate,
                eventCountry,
                eventCity,
                eventDescription,
                ticketPrice,
                currencyCode,
                numberOfOthers,
                eventBanner,
                attendees
            } = document.data();

            let data: EventCardProps = {
                createdBy: createdBy,
                eventName: eventName,
                eventDate: eventDate,
                eventCountry: eventCountry,
                eventCity: eventCity,
                eventBanner: eventBanner,
                OrganiserLogo: null,
                numberOfOthers: numberOfOthers,
                routerCallback: null,
                attendees: attendees,
                id: eventID
            }

            // Push structured data to array.
            eventData.push(data);
        })

        // Return post component array.
        return eventData.reverse();
    } catch (error) {
        console.log(`Error pulling public events: ${error}`);
        return null;
    }
}

/**
 * Pulls data relating to an event.
 * 
 * @param {PullEventArgs} 
 * @returns {Promise<EventDocument | null>}
 */
export async function pullEvent({eventIDArg}: PullEventArgs): Promise<EventDocument | null>{
    try{
        // Get reference to event.
        const eventRef = doc(
            FIRESTORE_DB,
            'EventsDB',
            `event_${eventIDArg}`
        )

        const docSnap = await getDoc(eventRef);

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Destructure document.
        const {
            // Event information.
            eventID,
            eventKey,
            createdBy,
            Timestamp,
            eventName,
            eventDate,
            eventCountry,
            eventCity,
            eventDescription,
            ticketPrice,
            currencyCode,
            numberOfOthers,
            // Analytics.
            ticketsSold,
            revenue,
            // Images.
            eventBanner,
            // Attendees.
            attendees,
        } = docSnap.data();

        const data: EventDocument = {
            eventID: eventID,
            eventKey: eventKey,
            createdBy: createdBy,
            Timestamp: Timestamp,
            eventName: eventName,
            eventDate: eventDate,
            eventCountry: eventCountry,
            eventCity: eventCity,
            eventDescription: eventDescription,
            ticketPrice: ticketPrice,
            currencyCode: currencyCode,
            numberOfOthers: numberOfOthers,
            ticketsSold: null,
            revenue: null,
            eventBanner: eventBanner,
            attendees: attendees
        }

        return data;
        
    } catch (error) {
        console.log(`Error pulling event: ${error}`);
        return null;
    }
}

/**
 * Add account to list of event attendees.
 * @param {AddAccountToEventAttendeesArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function addAccountToEventAttendees({accountID, eventID, organiserID}: AddAccountToEventAttendeesArgs): Promise<boolean | null>{
    try{
        // Retrieve document references.
        const eventSubCollRef = doc(
            FIRESTORE_DB, 
            'OrganiserAccounts', 
            `organiser_${organiserID}`, 
            'eventsSubCollection', 
            `event_${eventID}`
        );

        const eventDB = doc(
            FIRESTORE_DB, 
            'EventsDB', 
            `event_${eventID}`
        );

        // Update sub collection.
        await updateDoc(eventSubCollRef, {
            attendees: arrayUnion(accountID),
            numberOfOthers: increment(1)
        })

        // Update 'database'.
        await updateDoc(eventDB, {
            attendees: arrayUnion(accountID),
            numberOfOthers: increment(1)
        })

        return true;

    } catch (error) {
        console.log(`Error pulling event: ${error}`);
        return null;
    }
}

/*** TICKET FUNCTIONS ***/

/**
 * Initiates ticket purchase protocol for user
 * accounts.
 * 
 * @param {PurchaseTicketArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function purchaseTicket({eventID, organiserID, accountID}: PurchaseTicketArgs): Promise<boolean | null>{
    try{
        // Obtain event key.
        const eventOrganiserRef = doc(
            FIRESTORE_DB, 
            'OrganiserAccounts', 
            `organiser_${organiserID}`, 
            'eventsSubCollection',
            `event_${eventID}`
        );

        const docSnap = await getDoc(eventOrganiserRef);
        const {eventKey} = docSnap.data()

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Execute ticket minting protocol.
        const response = await mintTicket({userID: accountID, eventID: eventID, eventKey: eventKey})

        if(response === null){
            throw new Error("Error in application accessing mint ticket protocol.");
        }

        const ticketDocument: TicketDocument = {
            ticketID: response.ticketID,
            eventID: eventID,
            organiserID: organiserID,
            Timestamp: Timestamp.now(),
            cid: response.cid,
            txReceipt: response.txReceipt,
            validation: null
        }

        // Push ticket to user sub collection.
        const collectionRef = doc(
            FIRESTORE_DB, 
            'UserAccounts', 
            `user_${accountID}`, 
            'ticketsSubCollection',
            `ticket_${response.ticketID}`
        )

        await setDoc(collectionRef, ticketDocument);

        // Increment event attendees.
        const eventRef = doc(
            FIRESTORE_DB, 
            'EventsDB', 
            `event_${eventID}`
        );

        await updateDoc(eventRef, {
            numberOfOthers: increment(1)
        })

        await updateDoc(eventOrganiserRef, {
            numberOfOthers: increment(1)
        })

        return true;

    } catch (error) {
        console.log(`Error purchasing ticket: ${error}`);
        return null; 
    }
}

/**
 * Pulls all ticket documents for a 
 * specified user account.
 * 
 * @param {PullTicketsArgs} 
 * @returns {Promise<TicketBoxProps[] | null>}
 */
export async function pullTickets({accountID}: PullTicketsArgs): Promise<TicketBoxProps[] | null>{
    try{
        // Get reference to tickets sub collection.
        const collectionRef = collection(
            FIRESTORE_DB, 
            'UserAccounts', 
            `user_${accountID}`, 
            'ticketsSubCollection',
        )

        const docsSnap = await getDocs(collectionRef);

        // Raise error if null.
        if(docsSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return if empty.
        if(docsSnap.empty){
            return [];
        }

        const ticketData: TicketBoxProps[] = [];

        docsSnap.docs.forEach((document: any) => {
            const {
                ticketID,
                eventID, 
                organiserID,
                Timestamp,
            } = document.data();

            let data: TicketBoxProps = {
                ticketID: ticketID,
                eventID: eventID,
                organiserID: organiserID,
                id: ticketID
            }

            ticketData.push(data)
        })

        // Return array.
        return ticketData;

    } catch (error) {
        console.log(`Error pulling tickets: ${error}`);
        return null; 
    }
}

/**
 * Pulls specified ticket document for
 * a user.
 * 
 * @param {PullTicketArgs} 
 * @returns {Promise<TicketDocument | null>}
 */
export async function pullTicket({userID, ticketIDArg}: PullTicketArgs): Promise<TicketDocument | null>{
    try{
        // Fetch ticket from Firestore.
        const ticketRef = doc(
            FIRESTORE_DB,
            'UserAccounts', 
            `user_${userID}`, 
            'ticketsSubCollection',
            `ticket_${ticketIDArg}`
        )

        const docSnap = await getDoc(ticketRef);

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Destructure ticket data.
        const {
            ticketID,
            eventID,
            organiserID,
            Timestamp,
            cid,
            txReceipt,
            validation
        } = docSnap.data()

        const ticket: TicketDocument = {
            ticketID: ticketID,
            eventID: eventID,
            organiserID: organiserID,
            Timestamp: Timestamp,
            cid: cid,
            txReceipt: txReceipt,
            validation: validation,
        }

        return ticket;

    } catch (error) {
        console.log(`Error pulling ticket: ${error}`);
        return null; 
    }
}

/**
 * Adds a ticket validation request to
 * validation requests sub collection.
 *  
 * @param {CreateValidationRequestArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function createValidationRequest({userID, eventID, cid, txReceipt, ticketID}: CreateValidationRequestArgs): Promise<boolean | null>{

    try{
        // Obtain validation request.
        const request: ValidationRequest = {
            userID: userID,
            cid: cid,
            txReceipt: txReceipt,
            ticketID: ticketID
        }

        // Push request to firestore.
        const requestRef = doc(
            FIRESTORE_DB,
            'EventsDB',
            `event_${eventID}`,
            'ValidationRequests',
            `request_${userID}`
        )

        await setDoc(requestRef, request);
        return true;

    } catch (error) {
        console.log(`Error creating validation request: ${error}`);
        return null; 
    }
    
}

/**
 * Removes a ticket validation request from
 * validation requests sub collection.
 *  
 * @param {RemoveValidationRequestArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function removeValidationRequest({userID, eventID}: RemoveValidationRequestArgs): Promise<boolean | null>{
    try{
        // Obtain reference.
        const requestRef = doc(
            FIRESTORE_DB,
            'EventsDB',
            `event_${eventID}`,
            'ValidationRequests',
            `request_${userID}`
        )

        const docsSnap = await getDoc(requestRef);
        if(docsSnap.exists()){
            await deleteDoc(requestRef);
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.log(`Error removing validation request: ${error}`);
        return null; 
    }
}

/**
 * Performs validation for selected ticket,
 * removes ticket from requested validation 
 * pool.
 * 
 * @param {ValidateTicketArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function validateTicket({userID, eventID, cid, txReceipt, ticketID}: ValidateTicketArgs): Promise<boolean | null>{
    try{
        // Perform validation.
        const response = await validateTicketAPIRequest({
            userID: userID,
            eventID: eventID,
            cid: cid,
            txReceipt: txReceipt
        });

        if(response === null){
            throw new Error("Error in application accessing validation protocol.");
        }

        // Update ticket validation state.
        const ticketRef = doc(
            FIRESTORE_DB,
            'UserAccounts', 
            `user_${userID}`, 
            'ticketsSubCollection',
            `ticket_${ticketID}`
        )

        if(response){
            await updateDoc(ticketRef, {
                validation: 'validated'
            })
        } else {
            await updateDoc(ticketRef, {
                validation: 'fraudulent'
            })
        }

        return response;

    } catch (error) {
        console.log(`Error performing validation protocol: ${error}`);
        return null; 
    }
}

/*** ACCOUNT FUNCTIONS ***/

/**
 * Used to pull the username and profile photo 
 * for an account on the platform.
 * 
 * @param {PullAccountInfoArgs} 
 * @returns { Promise<AccountInfo | null>}
 */
export async function pullAccountInfo({accountID, context}: PullAccountInfoArgs): Promise<AccountInfo | null>{

    try{
        // Pull account document.
        let accountDocRef: DocumentReference;
        if(context === 'user'){
            accountDocRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${accountID}`, 
            );
        } else {
            accountDocRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${accountID}`, 
            );
        }

        // Destruct account username and profile photo URL.
        const docSnap = await getDoc(accountDocRef);
        let data: AccountInfo;

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        if(context === 'user'){
            const {username, profileImage} = docSnap.data();
            data = {
                accountID: accountID,
                accountType: context,
                username: username,
                profileImage: profileImage
            }
        } else {
            const {username, profileImage, organiserLogo} = docSnap.data();
            data = {
                accountID: accountID,
                accountType: context,
                username: username,
                profileImage: profileImage,
                organiserLogo: organiserLogo
            }
        }

        return data;

    } catch(error) {
        console.log(`Error pulling account info: ${error}`);
        return null;
    }
}

/**
 * Follows a given account (following) from another 
 * (follower).
 * 
 * @param {FollowUnfollowAccountArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function followUnfollowAccount({
    followerID, 
    followingID, 
    followerAccountType, 
    followingAccountType,
    isFollowing
}: FollowUnfollowAccountArgs): Promise<boolean | null>{
    try{
        // Get follower account ref.
        let followerRef: DocumentReference;
        if(followerAccountType === 'user'){
            followerRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${followerID}`, 
            );
        } else {
            followerRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${followerID}`, 
            );
        }

        // Follow / unfollow by adding or removing from following array.
        if(isFollowing){
            await updateDoc(followerRef, {
                following: arrayUnion(followingID)
            })
        } else {
            await updateDoc(followerRef, {
                following: arrayRemove(followingID)
            })
        }

        return true;

    } catch (error) {
        console.log(`Error following account: ${error}`);
        return null;
    }
}

/**
 * Checks if an account (follower) follows another 
 * account (following).
 * 
 * @param {IsFollowingArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function isFollowing({followerID, followerAccountType, followingID}: IsFollowingArgs): Promise<boolean | null>{
    try{
        // Get follower account ref.
        let followerRef: DocumentReference;
        if(followerAccountType === 'user'){
            followerRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${followerID}`,
            );
        } else {
            followerRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${followerID}`, 
            );
        }

        // Check with query.
        const docSnap = await getDoc(followerRef);

        if(docSnap === null || undefined){
            throw new Error("Nullish following array");
        }

        const {following} = docSnap.data();

        // Check if following.
        if(following.includes(followingID)){
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.log(`Error checking following: ${error}`);
        return null;
    }
}

/* RANDOM DATA: USED FOR DEMONSTRATIVE PURPOSES */


/**
 * @returns {OrganiserAnalytics} Random organiser account data.
 */
export function getRandomOrganiserAnalytics(): OrganiserAnalytics{

    // Followers.
    const {followers, deltaFollowers} = getRandomFollowerData();

    // Profile visits.
    const profileVisits = Math.round(Math.random() * 300);

    // Post likes.
    const postLikes = Math.round(Math.random() * 400);

    // Revenue.
    const revenue = getRandomTicketPrice();

    // Ticket sales proportions.
    const ticketSales = [];
    let total = 0; 
    const ticketSalesProportions = [];

    ticketSales[0] = Math.round(Math.random() * 1000);
    ticketSales[1] = Math.round(Math.random() * 1000);
    ticketSales[2] = Math.round(Math.random() * 1000);


    for(let month of ticketSales){
        total += month;
    }

    ticketSalesProportions[0] = Math.round((ticketSales[0] / total) * 100)
    ticketSalesProportions[1] = Math.round((ticketSales[1] / total) * 100)
    ticketSalesProportions[2] = Math.round((ticketSales[2] / total) * 100)


    // Month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const randomNumber = Math.floor(Math.random() * (11 - 0 + 1)) + 0;

    const ticketSalesData = {
        month1: {
            month: months[randomNumber % 12],
            proportion: ticketSalesProportions[0]
        },
        month2: {
            month: months[(randomNumber + 1) % 12],
            proportion: ticketSalesProportions[1]
        },
        month3: {
            month: months[(randomNumber + 2) % 12],
            proportion: ticketSalesProportions[2]
        }
    }

    const analytics: OrganiserAnalytics =  {
        followers: followers,
        profileVisits: profileVisits,
        postLikes: postLikes,
        deltaFollowers: deltaFollowers,
        revenue: revenue,
        ticketSalesData: ticketSalesData
    }

    return analytics;
}

/**
 * @returns {Object} Random follower number and change in follower number.
 */
function getRandomFollowerData(){

    const followers = Math.round(Math.random() * 1000);
    let deltaFollowers = Math.round(Math.random() * 100);

    if(Math.random() > 0.5){
        deltaFollowers *= -1;
    }
    const data =  {
        followers: followers,
        deltaFollowers: deltaFollowers
    }

    return data
}

/**
 * @returns {String} Random ticket price.
 */
function getRandomTicketPrice(): string{
    const currencies = ['$', '€', '£', '¥', '₹'];
    const minPrice = 10;
    const maxPrice = 3000;
  
    const randomPrice = (Math.random() * (maxPrice - minPrice)) + minPrice;
  
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    return `${randomCurrency} ${randomPrice.toFixed(2)}`;
}

/*** MESSAGES ***/

/**
 * Used to send a message between accounts.
 * Due to the nature of firebase, once a 
 * message is sent the corresponding  chat 
 * document is created in firestore.
 * 
 * The inboxes of both accounts are updated
 * accordingly.
 *  
 * @param {PushMessageArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function pushMessage({
    chatID,
    recipientID, 
    senderID, 
    content, 
    messageHeight, 
    senderAccountType, 
    recipientAccountType
}: PushMessageArgs): Promise<boolean | null>{
    try{

        // Label each message with timestamp.
        const seed = Date();
        const noSpace = seed.replace(/\s/g, '');
        const messageID = `message_${noSpace}`;

        // Obtain chat reference.
        const chatRef = doc(
            FIRESTORE_DB, 
            'ChatsDB', 
            chatID, 
            'messages',
            messageID
        )

        const messageDocument: MessageDocument = {
            createdBy: senderID,
            content: content,
            Timestamp: Timestamp.now(),
            messageID: messageID,
            messageHeight: messageHeight
        }

        await setDoc(chatRef, messageDocument);

        // Update recipient inbox.
        let recipientDocRef: DocumentReference;
        let senderDocRef: DocumentReference;

        // Recipient.
        if(recipientAccountType === 'user'){
            recipientDocRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${recipientID}`, 
                'inboxSubCollection',
                chatID
            );
        } else {
            recipientDocRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${recipientID}`,
                'inboxSubCollection' ,
                chatID
            );
        }
        
        const recipientInboxDocument: InboxDocument = {
            isRead: false,
            otherAccountID: senderID,
            otherAccountType: senderAccountType,
            chatID: chatID,
            latestMessage: content
        }

        // Sender.
        if(senderAccountType === 'user'){
            senderDocRef = doc(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${senderID}`, 
                'inboxSubCollection',
                chatID
            );
        } else {
            senderDocRef = doc(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${senderID}`,
                'inboxSubCollection' ,
                chatID
            );
        }

        const senderInboxDocument:InboxDocument = {
            isRead: true,
            otherAccountID: recipientID,
            otherAccountType: recipientAccountType,
            chatID: chatID,
            latestMessage: content
        }

        await setDoc(recipientDocRef, recipientInboxDocument, {merge: true});
        await setDoc(senderDocRef, senderInboxDocument, {merge: true});

        return true;

    } catch (error) {
        console.log(`Error sending message: ${error}`);
        return null;
    }
}

/**
 * Used to pull message history between 
 * accounts.
 * 
 * @param {PullMessagesArgs} 
 * @returns {Promise<MessageProps[] | null>}
 */
export async function pullMessages({chatID, recipientID, senderID}: PullMessagesArgs): Promise<MessageProps[] | null>{
    try{

        // Check if chat exists.
        const chatRef = collection(
            FIRESTORE_DB, 
            'ChatsDB', 
            chatID,
            'messages'
        );

        const docSnap = await getDocs(chatRef);

        // Raise error if null.
        if(docSnap === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        // Return empty messages if no chat history.
        if(docSnap.docs.length === 0){
            return [];
        }

        // Destructure and return message data. 
        const messages: MessageProps[] = [];
        docSnap.docs.forEach(async (document: any) => {
            const {
                createdBy, 
                content,
                messageID,
                messageHeight
            } = await document.data();

            const message: MessageProps = {
                createdBy: createdBy,
                content: content,
                messageID: messageID,
                messageHeight: messageHeight
            }
            messages.push(message);
        })

        return messages;

    } catch (error) {
        console.log(`Error pulling message: ${error}`);
        return null;
    }
}

/**
 * Returns the inbox data for a specified 
 * account.
 * 
 * @param {PullInboxArgs} 
 * @returns {Promise<InboxCardProps[] | null>}
 */
export async function pullInbox({accountID, accountType}: PullInboxArgs): Promise<InboxCardProps[] | null>{
    try{
        // Update recipient inbox.
        let accountDocRef: CollectionReference;
        if(accountType === 'user'){
            accountDocRef = collection(
                FIRESTORE_DB, 
                'UserAccounts', 
                `user_${accountID}`, 
                'inboxSubCollection',
            );
        } else {
            accountDocRef = collection(
                FIRESTORE_DB, 
                'OrganiserAccounts', 
                `organiser_${accountID}`,
                'inboxSubCollection' ,
            );
        }
        
        const docSnaps = await getDocs(accountDocRef);

        // Raise error if null.
        if(docSnaps === null){
            throw new Error(`Null data pulled from Firestore`);
        }

        if(docSnaps.empty){
            return [];
        }

        const virtualArray: InboxCardProps[] = [];
        docSnaps.docs.forEach((document) => {
            const {
                isRead, 
                otherAccountID, 
                otherAccountType, 
                chatID, 
                latestMessage
            } = document.data();

            const data: InboxCardProps = {
                isRead: isRead,
                accountID: otherAccountID,
                accountType: otherAccountType,
                chatID: chatID,
                latestMessage: latestMessage
            }
            virtualArray.push(data);
        })

        return virtualArray;

    } catch (error) {
        console.log(`Error pulling inbox: ${error}`);
        return null;
    }
}
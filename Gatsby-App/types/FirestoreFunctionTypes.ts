/**
 * This file contains type definitions for 
 * functions used to interact with the 
 * firestore backend.
 */

/* Import utilities. */

/*** ONBOARDING ***/

// Create new account.
export type OnboardingArgs = {
    // Account Information.
    accountID: string;
    email: string;
    username: string;
}

/*** POSTS ***/

// New post.
export type NewPostArgs = {
    // Account Information.
    accountID: string;
    context: string;
    content: string;
    contentHeight: number;
}

// Pull account posts.
export type PullAccountPostArgs = {
    // Account Information.
    accountID: string;
    context: string;
}

// Like / unlike post.
export type LikeUnlikePostArgs = {
    // Post information.
    postID: string;
    createdBy: string;
    accountType: string;
    // Mode.
    isLiking: boolean;
    accountLikingID: string;
    accountLikingType: string;
}

// Check if post is liked.
export type IsPostLikedArgs = {
    postID: string;
    accountID: string;
    accountType: string;
}

/*** EVENTS ***/

// New event.
export type NewEventArgs = {
    // Event information.
    accountID: string;
    eventName: string;
    eventDate: string;
    eventCountry: string;
    eventCity: string;
    eventDescription: string;
    ticketPrice: number;
    currencyCode: string;
}

// Pull account events.
export type PullEventCardsArgs = {
    // Event information.
    accountID: string;
}

// Pull account events data.
export type PullAccountEventDataCardsArgs = {
    // Event information.
    accountID: string;
}

// Pull event.
export type PullEventArgs = {
    eventIDArg: string;
}

// Pull event.
export type PullEventDataArgs = {
    eventIDArg: string;
    accountID: string;
}

// Add user account to attendees.
export type AddAccountToEventAttendeesArgs = {
    accountID: string;
    eventID: string;
    organiserID: string;
}

/*** TICKETS ***/

// Purchase ticket.
export type PurchaseTicketArgs = {
    eventID: string;
    organiserID: string;
    accountID: string;
}

// Pull tickets.
export type PullTicketsArgs = {
    accountID: string;
}

// Pull ticket data.
export type PullTicketArgs = {
    userID: string;
    ticketIDArg: string;
}

// Create validation request.
export type CreateValidationRequestArgs = {
    userID: string;
    eventID: string;
    cid: string;
    txReceipt: string;
    ticketID: string;
}

// Remove validation request.
export type RemoveValidationRequestArgs = {
    userID: string;
    eventID: string;
}

// Validate ticket from organiser.
export type ValidateTicketArgs = {
    userID: string;
    eventID: string;
    cid: string;
    txReceipt: string;
    ticketID: string
}

/*** ACCOUNTS ***/

// Pull account info.
export type PullAccountInfoArgs = {
    accountID: string;
    context: string;
}

// Follow account.
export type FollowUnfollowAccountArgs = {
    followerID: string;
    followingID: string;
    followerAccountType: string;
    followingAccountType: string;
    isFollowing: boolean
}

// Check if following.
export type IsFollowingArgs = {
    followerID: string;
    followingID: string;
    followerAccountType: string;
}

/*** MESSAGES ***/

// Send message.
export type PushMessageArgs = {
    chatID: string;
    recipientID: string;
    senderID: string;
    senderAccountType: string;
    recipientAccountType: string;
    content: string;
    messageHeight: number
}

// Pull messages.
export type PullMessagesArgs = {
    chatID: string;
    recipientID: string;
    senderID: string;
}

// Pull inbox.
export type PullInboxArgs = {
    accountID: string;
    accountType: string;
}
/**
 * This file contains type definitions for
 * the data stored on the firestore backend.
 * 
 * Documents are abstracted as type instances,
 * sub-collections are fields that utilise the 
 * type of another document.
 */

/* Import utilities. */
import { Timestamp } from 'firebase/firestore'

/*** ACCOUNT ***/
type BaseAccount = {
    // Account information.
    accountID: string;
    accountType: string;
    username: string;
    email: string;
    // Images.
    profileImage: string | null;
    // Array information.
    following: string []; // <AccountID>
    likedPosts: string[]; // <PostID>
    chats: string[];      // <ChatID>
    // Sub-collections.
    postsSubCollection: PostDocument[];
}

/*** USER ACCOUNT ***/
export interface UserAccountDocument extends BaseAccount {
    // Sub-collections.
    ticketsSubCollection: TicketDocument[];
}

/*** ORGANISER ACCOUNT ***/
export interface OrganiserAccountDocument extends BaseAccount {
    // Images.
    organiserLogo: string | null;
    // Sub-collections.
    eventsSubCollection: EventDocument[];
}

/*** ACCOUNT INFO ***/
export type AccountInfo = {
    // Account information.
    accountID: string;
    accountType: string;
    username: string;
    profileImage: string | null;
    organiserLogo? :string | null;
}

/*** ORGANISER ANALYTICS ***/
export type OrganiserAnalytics = {
    followers: number;
    profileVisits: number;
    postLikes: number;
    deltaFollowers: number;
    revenue: string;
    ticketSalesData: TicketSalesData
}

type TicketSalesData = {
    month1: {
        month: string;
        proportion: number
    },
    month2: {
        month: string;
        proportion: number
    },
    month3: {
        month: string;
        proportion: number
    }
}

/*** POST ***/
export type PostDocument = {
    // Post information.
    postID: string;
    createdBy: string;  // <AccountID>
    accountType: string;
    timestamp: Timestamp;
    content: string;
    contentHeight: number;
    likes: number;
    // Media.
    media: string | null;
}

/*** TICKET ***/
export type TicketDocument = {
    // Ticket information.
    ticketID: string;
    eventID: string;
    organiserID: string; // <AccountID>
    Timestamp: Timestamp;
    validation: string;
    cid: string;
    txReceipt: string;
}

export type ValidationRequest = {
    userID: string;
    cid: string;
    txReceipt: string;
    ticketID: string;
}

/*** EVENT ***/
export type EventDocument = {
    // Event information.
    eventID: string;
    eventKey: string;
    createdBy: string;  // <AccountID>
    Timestamp: Timestamp;
    eventName: string;
    eventDate: string;
    eventCountry: string;
    eventCity: string;
    eventDescription: string;
    ticketPrice: number;
    currencyCode: string;
    numberOfOthers: number;
    // Analytics.
    ticketsSold: number | null;
    revenue: number | null;
    // Images.
    eventBanner: string | null;
    // Attendees.
    attendees: string[];  // <AccountID>
}

/*** CHAT ***/
export type ChatDocument = {
    // Chat information.
    accounts: string[];  // <AccountID>
    // Sub-collections.
    messagesSubCollection: MessageDocument[];
}

// Message document for chat.
export type MessageDocument = {
    createdBy: string;  // <AccountID>
    content: string;
    Timestamp: Timestamp;
    messageID: string;
    messageHeight: number;
}

// Inbox document.
export type InboxDocument = {
    isRead: boolean;
    otherAccountID: string;
    otherAccountType: string;
    chatID: string;
    latestMessage: string;
}
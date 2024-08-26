/**
 * This file contains a single repository
 * for the types required by each UI component.
 */

/* Import utilities. */
import { ImageSource } from "expo-image";

/*** NAVIGATION BAR COMPONENT ***/
export type NavbarProps = {
    navigationState: string;
    isParentScrolling: boolean;
}

/*** ATTENDEE DETAILS COMPONENT ***/
export type AccountDetailsProps = {
    accountID: string;
}

/*** VALIDATION REQUEST COMPONENT ***/
export type ValidationRequestComponentProps = {
    userID: string;
    eventID: string;
    cid: string;
    txReceipt: string;
    ticketID: string;
}

/*** INBOX CARD ***/
export type InboxCardProps = {
    isRead: string;
    accountID: string;
    accountType: string;
    chatID: string;
    latestMessage: string;
}

/* TICKET BOX COMPONENT */
export type TicketBoxProps = {
    ticketID: string;
    eventID: string;
    organiserID: string;
    id: string;
}

/*** MESSAGE ***/
export type MessageProps = {
    createdBy: string;  // <AccountID>
    content: string;
    messageID: string;
    messageHeight: number;
}

/*** POST COMPONENT ***/
export type PostComponentProps = {
    createdBy: string;
    context: string;
    username: string;
    profileImage: string;
    containsMedia: boolean;
    mediaImage: string | null;
    contentHeight: number;
    content: string | null;
    routerCallback: () => void;
    likes: number;
    postID: string;
}

// Flat list item, used for render callback.
export interface PostComponentItemProps extends PostComponentProps {
}

/*** EVENT CARD COMPONENT ***/
export type EventCardProps = {
    createdBy: string;
    eventName: string;
    eventDate: string;
    eventCountry: string;
    eventCity: string;
    eventBanner: string;
    OrganiserLogo: string | null;
    numberOfOthers: number;
    attendees: string[];
    routerCallback: () => void;
    id: string;
}

// Flat list item, used for render callback.
export interface EventCardItemProps extends EventCardProps {
}

/*** EVENT DATA CARD COMPONENT ***/
export type EventDataCardProps = {
    eventName: string;
    eventDate: string;
    eventBanner: string;
    organiserLogo: string | null;
    revenue: number;
    ticketsSold: number;
    ticketPrice: number;
    currencyCode: string;    
    tag: string;
    eventID: string;
}

/*** FOLLOWING BUTTON COMPONENT ***/
export type FollowingButtonProps = {
    followerID: string;
    followingID: string;
    followerAccountType: string;
    followingAccountType: string;
}

/*** BACK NAVIGATION BUTTON ***/
export type BackNavigationButtonProps = {
    onPress: () => void;
}
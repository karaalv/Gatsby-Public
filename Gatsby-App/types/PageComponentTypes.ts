/**
 * This file contains a single repository
 * for the types required by modularised
 * profile components.
 */

/*** EVENT PAGE ***/
export type EventPageProps = {
    eventID: string;
    createdBy: string;
    organiserRoute: () => void | null;
    accountScope: string;
}

/*** NEW POST PAGE ***/
export type NewPostPage = {
    context: string;
}

/*** EVENT LIST PAGE ***/
export type EventListPageProps = {
    rootPath: string;
    accountScope: string;
    accountID: string;
}

/*** INBOX PAGE ***/
export type InboxPageProps = {
    accountScope: string;
}

/*** EXPLORE PAGE ***/
export type ExplorePageProps = {
    accountScope: string;
}

/*** EXPLORE SEARCH PAGE ***/
export type ExploreSearchPageProps = {
    accountScope: string;
    searchString: string;
}

/*** ORGANISER PROFILE ***/
export type OrganiserProfileComponentProps = {
    accountID: string;
    rootPath: string;
    accountScope: string;
}

/*** USER PROFILE ***/
export type UserProfileComponentProps = {
    accountID: string;
    rootPath: string;
    accountScope: string;
}


/**
 * This file contains type definitions for 
 * functions used to interact with the client
 * API.
 */

/* Import utilities. */

/*** EVENTS ***/

// New event.
export type NewEventResponse = {
    eventID: string;
    eventKey: string;
}

/*** TICKETS ***/

// Ticket minting.
export type MintTicketArgs = {
    userID: string;
    eventID: string;
    eventKey: string;
}

export type MintTicketResponse = {
    ticketID: string;
    cid: string;
    txReceipt: string;
}

// Ticket validation.
export type ValidateTicketAPIArgs = {
    userID: string;
    eventID: string;
    cid: string;
    txReceipt: string;
}


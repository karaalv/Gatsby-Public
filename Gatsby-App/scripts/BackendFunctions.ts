/**
 * This file contains functions for various backend processes 
 * throughout the application. The functions encapsulated within 
 * this file act as an interface between the clientAPI and the 
 * client application.
 */

/* Import utilities. */

/* Import API Types */
import { 
    MintTicketArgs,
    MintTicketResponse,
    NewEventResponse, 
    ValidateTicketAPIArgs
} from "../types/BackendFunctionTypes";

/* GLOBAL VARIABLES */
const API_HEADER = {
    'gatsby-network-token': process.env.EXPO_PUBLIC_GATSBY_NETWORK_TOKEN,
    'content-Type': 'application/json'
}

/**
 * Returns an event ID and corresponding 
 * event key from client API.
 * 
 * @returns {NewEventResponse | null}
 */
export async function generateNewEventIDAndKey(): Promise<NewEventResponse | null>{
    try{

        // Endpoint.
        const url = `${process.env.EXPO_PUBLIC_CLIENT_API_HTTP}/newEvent`;

        const response = await fetch(url, {
            method: 'GET',
            headers: API_HEADER
        })

        // Throw error on null API response.
        if(response == null){
            throw new Error("Null API response.");
        }

        // Throw error on server error.
        if(response.status === 503 || response.status === 500){
            throw new Error("Server error.");
        }

        // Extract data.
        const {eventID, eventKey} = await response.json();

        const newEventData: NewEventResponse = {
            eventID: eventID,
            eventKey: eventKey
        }

        // Return new event ID and key.
        console.log(newEventData);
        return newEventData;

    } catch (error) {
        console.log(`Error on '/newEvent' endpoint: ${error}`);
        return null;
    }
}

/**
 * Executes minting protocol in client 
 * API to mint new ticket for user.
 * 
 * @param {MintTicketArgs} 
 * @returns {Promise<MintTicketResponse | null>}
 */
export async function mintTicket({userID, eventID, eventKey}: MintTicketArgs): Promise<MintTicketResponse | null>{
    try{
        // Endpoint.
        const url = `${process.env.EXPO_PUBLIC_CLIENT_API_HTTP}/mintTicket`;

        // Request body.
        const body = {
            userID: userID,
            eventID: eventID,
            eventKey: eventKey
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: API_HEADER,
            body: JSON.stringify(body)
        })

        // Throw error on null API response.
        if(response == null){
            throw new Error("Null API response.");
        }

        // Throw error on server error.
        if(response.status === 503 || response.status === 500){
            throw new Error("Server error.");
        }

        // Extract data.
        const {mintingProcedure, ipfsProcedure, blockchainProcedure} = await response.json();

        // Return mint response.
        const newTicket: MintTicketResponse = {
            ticketID: mintingProcedure.ticketData.ticketID,
            cid: ipfsProcedure.cidAddress,
            txReceipt: blockchainProcedure.txReceipt
        }

        console.log(newTicket);
        return newTicket;

    } catch (error) {
        console.log(`Error on '/mintTicket' endpoint: ${error}`);
        return null;
    }
}

/**
 * Executes validation protocol for ticket 
 * data.
 * 
 * @param {ValidateTicketAPIArgs} 
 * @returns {Promise<boolean | null>}
 */
export async function validateTicketAPIRequest({userID, eventID, cid, txReceipt}: ValidateTicketAPIArgs): Promise<boolean | null>{
    try{
        // Endpoint.
        const url = `${process.env.EXPO_PUBLIC_CLIENT_API_HTTP}/validate`;

        // Request body.
        const body = {
            userID: userID,
            currentEventID: eventID,
            cid: cid,
            txReceipt: txReceipt
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: API_HEADER,
            body: JSON.stringify(body)
        })

        // Throw error on null API response.
        if(response == null){
            throw new Error("Null API response.");
        }

        // Throw error on server error.
        if(response.status === 503 || response.status === 500){
            throw new Error("Server error.");
        }

        // Extract verdict.
        const {validation} = await response.json();
        return validation;

    } catch (error) {
        console.log(`Error on '/validate' endpoint: ${error}`);
        return null;
    }
}
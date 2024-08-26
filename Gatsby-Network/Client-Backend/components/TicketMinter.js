// Import environment variables.
require('dotenv').config({path: '../../../.env'});

/**
 * Import class utilities.
 */

// Static class abstraction.
const StaticClass = require('./StaticClass');

// Crypto API for cryptography operations.
const { createHash }  = require('crypto');

// Web3 for logic relating to ticket signature. 
const { Web3 } = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(`http://${process.env.BLOCKCHAIN_HTTP_ADDRESS}`));

/**
 * The TicketMinter class encapsulates all the 
 * behaviour needed for the creation of ticket 
 * data.
 */
class TicketMinter extends StaticClass{
    // Instantiate static behaviour.
    constructor(){
        super();
    }

    /**
     * This method generates a random string
     * to be used in the creation of the 
     * ticketID.
     * 
     * @returns nonce
     */
    static generateNonce(){
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const nonceLength = 7;
        let nonce = "";

        for(let i = 0; i<nonceLength; i++){
            let randomNo = Math.round(Math.random() * characters.length);
            nonce += characters.charAt(randomNo);
        }

        return nonce;
    }

    /**
     * This function generates each tickets
     * unique ID.
     * 
     * Each ticketID is the SHA256 of the unique
     * userID, the eventID and a randomly generated 
     * nonce.
     * 
     * @param {string} userID 
     * @param {string} eventID 
     * @returns ticketID
     */
    static generateTicketID(userID, eventID){
        const ticketString = (userID + this.generateNonce() + eventID);

        const ticketID = createHash('sha256').update(ticketString).digest('hex');

        return ticketID;
    }

    /**
     * TicketID is signed by the private key of the 
     * event to produce a verifiable ticket signature.
     * 
     * @param {string} ticketID 
     * @param {string} eventKey 
     * @returns Ticket signature
     */
    static generateTicketSignature(ticketID, eventKey){
        const { signature } = web3.eth.accounts.sign(ticketID, eventKey);
        return signature;
    }

    /**
     * Mints a ticket for a given event, event details
     * are passed as parameters.
     * 
     * @param {string} userID 
     * @param {string} eventID 
     * @param {string} eventKey 
     * @returns Ticket data object 
     */
    static mintTicket(userID, eventID, eventKey){
        let response; 

        try{
            // Successful ticket minting.
            const ticketID = this.generateTicketID(userID, eventID);
            const ticketSignature = this.generateTicketSignature(ticketID, eventKey);
            
            const ticketData = {
                metaData : {
                    timestamp: new Date(),
                },

                ticketID: ticketID, 
                eventID: eventID, 
                ticketSignature: ticketSignature,
    
            };

            response = {
                mintingStatus: true, 
                message: "Ticket successfully minted.",
                ticketData: ticketData,
                serverError: null
            }

        } catch (error) {
            // Ticket minting error response.
            response = {
                mintingStatus: false,
                message: "Unable to mint ticket.",
                ticketData: null,
                serverError: error.message
            }
        }

        return response;
    }
    
}

// Export module using Common JS standard.
module.exports = TicketMinter;
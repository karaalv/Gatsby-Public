// Import environment variables.
require('dotenv').config({path: '../../../.env'});

/* Import class utilities */

// Import firebase services.
// const { initializeApp } = require('firebase-admin/app');
// const { getFirestore } = require('firebase-admin/firestore');

// Providers.
const { initializeApp } = require('firebase/app');
const { getFirestore, getDoc } = require('firebase/firestore');

// Methods.
const { 
    doc, 
    collection,  
    setDoc, 
    updateDoc, 
    deleteDoc
} = require('firebase/firestore');

const firebaseConfig = {
    // Redacted for security.
};

// Static class abstraction.
const StaticClass = require('./StaticClass');

class FirebaseInterface extends StaticClass {

    static FIREBASE_APP;
    static FIRESTORE_DB;

    // Instantiate static behaviour.
    constructor(){
        super();
    }

    /* NETWORK MANAGEMENT */

    /**
     * Initialise connection to firebase 
     * project.
     * @returns response object.
     */
    static initialiseInterface(){
        try{
            this.FIREBASE_APP = initializeApp(firebaseConfig);
            this.FIRESTORE_DB = getFirestore(this.FIREBASE_APP);

            const response = {
                initialisationStatus: true,
                message: "Successfully initialised Firebase.",
                error: null
            }

            return response;
        } catch (error) {
            // Catch initialisation error.
            const response = {
                initialisationStatus: false,
                message: `Unable to initialise Firebase: ${error.message}`,
                error: error
            }

            return response;
        }
    }

    // Empty.
    static restoreConnection(){
    }

    /* CORE FUNCTIONS */

    /**
     * Records the latest transaction hash 
     * for a given ticket ID. 
     * @param {string} ticketID 
     * @param {string} txHash 
     * @returns response object.
     */
    static async recordTicketLUT(ticketID, txHash){
        // Define lut entry.
        const lutEntry = {
            ticketID: ticketID,
            txHash: txHash,
            validated: false
        }

        try{
            // Define LUT reference.
            const lutRef = doc(
                this.FIRESTORE_DB,
                'Server',
                'TicketLut',
                'LUT',
                `ticket_${ticketID}`
            )
            
            // Set document.
            await setDoc(lutRef, lutEntry);

            return {
                status: true,
                message: 'Successfully recorded ticket.',
                lutEntry: lutEntry,
                error: null
            }

        } catch (error) {
            // Catch firebase error.
            return {
                status: false,
                message: 'Unable to record ticket.',
                lutEntry: lutEntry,
                error: error
            }
        }
    }

    /**
     * Validates if transaction hash is latest 
     * for ticket ID.
     * 
     * Codes for responses.
     * 
     * 0 -> Internal error.
     * 1 -> Successful.
     * 2 -> Invalid TxHash.
     * 3 -> TxHash already validated. 
     * 
     * @param {string} ticketIDArg 
     * @param {string} txHashArg 
     * @returns response object.
     */
    static async validateTxHash(ticketIDArg, txHashArg){
        try{
            // Define LUT reference.
            const lutRef = doc(
                this.FIRESTORE_DB,
                'Server',
                'TicketLut',
                'LUT',
                `ticket_${ticketIDArg}`
            )

            // Retrieve LUT entry.
            const docSnap = await getDoc(lutRef);

            // Catch error for null data.
            if(docSnap == null){
                const response = {
                    verdict: null,
                    code: 0,
                    message: 'Nullish data returned from Firestore.',
                    error: null
                }
                return response;
            }

            // Destructure document.
            const {
                ticketID, 
                txHash,
                validated
            } = docSnap.data();

            // Catch null data.
            if(ticketID == null || txHash == null || validated == null){
                const response = {
                    verdict: null,
                    code: 0,
                    message: 'Nullish data destructured from Firestore.',
                    error: null
                }
                return response;
            }

            // Validate data.
            if(txHash !== txHashArg){
                const response = {
                    verdict: false,
                    code: 2,
                    message: 'Invalid transaction hash.',
                    error: null
                }
                return response;
            }

            // Check if ticket has been validated.
            if(validated === true){
                const response = {
                    verdict: false,
                    code: 3,
                    message: 'Ticket has already been validated.',
                    error: null
                }
                return response;
            }

            // Return successful pass.
            const response = {
                verdict: true,
                code: 1,
                message: 'Valid transaction hash.',
                error: null
            }
            return response;

        } catch (error) {
            const response = {
                verdict: null,
                code: 0,
                message: error.message,
                error: error
            }
            return response;
        }
    }

    /**
     * Marks a ticket as validated in ticket
     * LUT.
     * 
     * @param {string} ticketID 
     * @returns 
     */
    static async markTicketAsValidated(ticketID){
        try{
            // Define LUT reference.
            const lutRef = doc(
                this.FIRESTORE_DB,
                'Server',
                'TicketLut',
                'LUT',
                `ticket_${ticketID}`
            )
            
            // Set document.
            await updateDoc(lutRef, {
                validated: true
            });

            return {
                status: true,
                message: 'Successfully updated ticket in LUT.',
                error: null
            }

        } catch (error) {
            // Catch firebase error.
            return {
                status: false,
                message: `Unable to update ticket in LUT. Error: ${error.message}`,
                error: error
            }
        }
    }

}

module.exports = FirebaseInterface;
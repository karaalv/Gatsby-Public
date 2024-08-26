// Import environment variables.
require('dotenv').config({path: '../../../.env'});

/**
 * Import class utilities.
 */
// Static class abstraction.
const StaticClass = require('./StaticClass');

/**
 * OrphanRestoration class to handle graceful degradation 
 * of platform in the event blockchain is down.
 */
class OrphanRestoration extends StaticClass{
    static BlockchainInterface;
    static ignition = false;
    static setIntervalID;
    static intervalTime = 3000;

    // Pseudo database for restoration procedure.
    static database = {};
    static orphanList = [];

    // Instantiate static behaviour.
    constructor(){
        super();
    }

    /**
     * Used to initialise blockchain interface in 
     * global state.
     * @param {BlockchainInterface} blockchainInterface 
     */
    static setBlockchainInterface(blockchainInterface){
        this.BlockchainInterface = blockchainInterface;
    }
    
    /**
     * Begins the restoration protocol, at
     * set interval connection to blockchain 
     * is tested, when connection is reestablished 
     * orphan restoration can close.
     */
    static async startRestoration(){
        console.log("Connection to blockchain lost, commencing restoration protocol ... ");
        this.ignition = true;

        if(this.ignition){
            this.setIntervalID = setInterval(async () => {
                // Check connection status.
                const { connectionStatus } = await this.BlockchainInterface.isConnected();
                if(connectionStatus){
                    // Reinitialise blockchain interface.
                    const { initialisationStatus } = await this.BlockchainInterface.initialiseInterface();
                    if(initialisationStatus){
                        await this.closeRestoration();
                    } else {
                        console.log("Failure to initialise blockchain interface during restoration.");
                    }
                }
            }, this.intervalTime);
        }
    }

    /**
     * Begins shutdown of restoration protocol,
     * in the event the blockchain network 
     * loses connection during shutdown, 
     * restoration protocol restarts.
     */
    static async closeRestoration(){
        console.log("Connection to blockchain restored, closing restoration protocol.");
        // End connection checker. 
        clearInterval(this.setIntervalID);

        // Offload data from temporary storage.
        const status = await this.offloadOrphanPool();
        if(status){
            this.ignition = false;
        } else {
            // Restart restoration.
            await this.startRestoration();
        }
    }

    /**
     * Used to load ticket purchase data 
     * onto recovery database.
     * 
     * @param {string} userID 
     * @param {string} ticketID 
     * @param {string} eventID 
     */
    static addToOrphanPool(ticketID, eventID, userID, prevUserID, prevTxHash){
        this.database[userID] = {
            ticketID: ticketID, 
            eventID: eventID,
            userID: userID, 
            prevUserID: prevUserID,
            prevTxHash: prevTxHash
        }
        this.orphanList.push(userID);
    }

    /**
     * Used to migrate ticket data from recovery database 
     * onto blockchain.
     * 
     * @returns state of offloading procedure.
     */
    static async offloadOrphanPool(){
        
        for(let currentUserID of this.orphanList){

            const ticketID = this.database[currentUserID].ticketID;
            const eventID = this.database[currentUserID].eventID;
            const userID = this.database[currentUserID].userID;
            const prevUserID = this.database[currentUserID].prevUserID;
            const prevTxHash = this.database[currentUserID].prevTxHash

            // Push data onto blockchain.
            const { logStatus } = await this.BlockchainInterface.logOwnership(ticketID, eventID, userID, prevUserID, prevTxHash);

            if(logStatus){
                // Continue to next iteration.
                delete this.database[currentUserID];
                continue;
            } else {
                // Upon failure of restoration protocol, restart
                // orphan recovery procedure.
                return false;
            }
        }
        return true;
    }
}

module.exports = OrphanRestoration;
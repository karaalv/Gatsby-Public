/*** SETUP ***/

// Import environment variables.
require('dotenv').config({path: '../../.env'});

/**
 * Import Ticket Minter class, this class contains 
 * all logic pertaining to ticket creation, the 
 * class is static and takes dependent parameters 
 * as arguments.
 */
const TicketMinter = require('./components/TicketMinter.js');

/**
 * Ipfs Interface is used ot contain all logic that 
 * allows the application to communicate with the 
 * IPFS network.
 * 
 * The class is static and only contains 'push'
 * and 'pull' methods for the network.
 */
const IpfsInterface = require('./components/IpfsInterface.js')

/**
 * Blockchain Interface is used to run interactions 
 * with the Ethereum network; this includes posting
 * purchase data to logs and querying transactions 
 * during validation.
 */
const BlockchainInterface = require('./components/BlockchainInterface.js');

/**
 * Orphan restoration protocol in event blockchain network
 * fails during ticket minting procedure.
 */
const OrphanRestoration = require('./components/OrphanRestoration.js');
OrphanRestoration.setBlockchainInterface(BlockchainInterface);

/**
 * Firebase Interface is used to provide state to
 * the server, for the current scope of development 
 * this is the same database as the application.
 */
const FirebaseInterface = require('./components/FirebaseInterface.js');

/**
 * Express.js is used to develop API 
 * endpoints for ticketing system.
 */
const express = require('express');
const app = express ();
const port = process.env.CLIENT_API_PORT;

// Express configuration.
app.use(express.json(), authentication);

/*** MIDDLEWARE ***/

// Middleware function used to protect server endpoints.
function authentication(request, response, next){
    const token = request.headers['gatsby-network-token'];

    if(token === null){
        return response.status(401).json({ message: "Token missing" });
    }

    if(token === process.env.GATSBY_NETWORK_TOKEN){
        next();
    } else {
        return response.status(401).json({ message: "Invalid token" });
    }
}

/*** SERVER UTILITIES ***/

//

/*** ENDPOINTS ***/

/**
 * Using the TicketMinter, this endpoint will generate 
 * a new ticket for a given event.
 * 
 * If the ticket is successfully minted, it is pushed 
 * onto the IPFS network.
 * 
 * Once successfully pushed to IPFS, genesis ownership is 
 * logged on Blockchain.
 */
app.post('/mintTicket',  async (request, response) => {

    // Obtain payload from request.
    const payload = request.body;
    const {userID, eventID, eventKey} = await payload;

    // Check if blockchain interface is online.
    if(await BlockchainInterface.connectionStatus){
        // If blockchain interface is online, proceed to mint.

        // Mint ticket data.
        const mintResponse = TicketMinter.mintTicket(userID, eventID, eventKey);
        const { mintingStatus } = mintResponse;

        // If ticket is successfully minted, push to IPFS.
        if(mintingStatus){
            // Push data to IPFS.
            const { ticketData } = mintResponse
            const ipfsResponse = await IpfsInterface.push(ticketData);

            const { uploadStatus } = ipfsResponse;

            // If ticket successfully uploaded, push to blockchain.
            if(uploadStatus){
                // Log purchase onto blockchain.
                const {ticketID, eventID} = mintResponse.ticketData;
                const prevUserID = BlockchainInterface.gatsbyUserID
                const prevTxHash = BlockchainInterface.genesisOwnershipHash
                const blockchainResponse = await BlockchainInterface.logOwnership(
                    ticketID, 
                    eventID, 
                    userID, 
                    prevUserID, 
                    prevTxHash
                );
                const { logStatus } = blockchainResponse;

                // If ticket successfully logged to blockchain end procedure.
                // Store details in ticket LUT.
                if(logStatus){

                    // Add entry to ticket LUT.
                    const lutResponse = await FirebaseInterface.recordTicketLUT(
                        mintResponse.ticketData.ticketID,
                        blockchainResponse.txReceipt
                    )

                    const protocolSummary = {
                        protocolStatus: true,
                        message: "Ticket successfully purchased.",
                        mintingProcedure: mintResponse,
                        ipfsProcedure: ipfsResponse,
                        blockchainProcedure: blockchainResponse
                    }
                    return response.status(201).send(protocolSummary);

                } else {
                    
                    // Failure to upload to blockchain results in 
                    // orphan restoration protocol.

                    // Orphan restoration procedure.
                    if(!OrphanRestoration.ignition){
                        await OrphanRestoration.startRestoration();
                    }

                    OrphanRestoration.addToOrphanPool(ticketID, eventID, userID, prevUserID, prevTxHash);

                    const protocolSummary = {
                        protocolStatus: false,
                        message: "Blockchain network error, entering orphan restoration.",
                        mintingProcedure: mintResponse,
                        ipfsProcedure: ipfsResponse,
                        blockchainProcedure: blockchainResponse
                    }
                    return response.status(307).send(protocolSummary);
                }
            } else {
                // Failure to upload to IPFS.
                const protocolSummary = {
                    protocolStatus: false,
                    message: "Failure to upload to IPFS.",
                    mintingProcedure: mintResponse,
                    ipfsProcedure: ipfsResponse,
                    blockchainProcedure: null
                }
                return response.status(500).send(protocolSummary);
            } 

        } else {
            // Failure to mint ticket.
            const protocolSummary = {
                protocolStatus: false,
                message: "Failure to mint ticket.",
                mintingProcedure: mintResponse,
                ipfsProcedure: null,
                blockchainProcedure: null
            }
            return response.status(500).send(protocolSummary);
        }
    } else {
        // If blockchain interface is offline begin restoration.
        await BlockchainInterface.restoreConnection();
        const protocolSummary = {
            protocolStatus: false,
            message: "Blockchain interface offline, unable to mint ticket.",
            mintingProcedure: null,
            ipfsProcedure: null,
            blockchainProcedure: null
        }
        return response.status(503).send(protocolSummary);
    }
});

/**
 * Endpoint used to generate event ID and event
 * key.
 */
app.get('/newEvent', async(request, response) => {

    // Check blockchain interface is online.
    if(BlockchainInterface.connectionStatus){

        try{
            // Generate event ID and event key.
            const pair = BlockchainInterface.newEvent();

            if(pair == null){
                throw new Error('Null asymmetrical credentials.')
            }

            // Return event ID and event key
            const newEventResponse = {
                eventID: pair.eventID,
                eventKey: pair.eventKey,
                message: "Successfully created event ID and event key.",
            }
            response.status(200).send(newEventResponse);

        } catch (error){
            // Catch new event generation errors.
            const newEventResponse = {
                eventID: null,
                eventKey: null,
                message: error.message,
            } 
            response.status(500).send(newEventResponse);
        }

    } else {
        // Blockchain interface offline, begin restoration.
        await BlockchainInterface.restoreConnection();
        const newEventResponse = {
            eventID: null,
            eventKey: null,
            message: "Blockchain interface offline, unable to create new event.",
        }
        response.status(503).send(newEventResponse);
    }
});

/**
 * Passes ownership from one user ID to another.
 * 
 * Ticket information pulled from IPFS, checked 
 * for errors before continuing.
 * 
 * Head ownership log is validated, followed by 
 * validating ownership history.
 * 
 * If all checks passed, new ownership is logged
 * and new details are returned.   
 */
app.post('/passOwnership', async(request, response) => {

    // Obtain data payload from request body.
    const payload = request.body;
    const {currentUserID, newUserID, cid, txReceipt} = await payload;

    // Check if blockchain interface is online.
    if(BlockchainInterface.connectionStatus){
        
        /* PULL IPFS DATA */

        // Fetch ticket information from IPFS.
        const ipfsResponse = await IpfsInterface.pull(cid);

        // Check for IPFS error.
        if(ipfsResponse.ipfsResponse === null || ipfsResponse.ipfsResponse === undefined){
            // Handle invalid IPFS data request.
            if(ipfsResponse.serverError === "Invalid IPFS Gatsby Token."){
                const ownershipPassSummary = {
                    passOwnershipStatus: true,
                    passOwnershipVerdict: false,
                    message: "Invalid IPFS Gatsby Token.",
                    validationResponse: null,
                    validationHistoryResponse: null,
                    result: null
                }
                return response.status(403).send(ownershipPassSummary);
            } else {
                // Handle internal server error.
                const ownershipPassSummary = {
                    passOwnershipStatus: false,
                    passOwnershipVerdict: null,
                    message: "Unable to pull IPFS data.",
                    validationResponse: null,
                    validationHistoryResponse: null,
                    result: null
                }
                return response.status(500).send(ownershipPassSummary);
            }
        }

        // Destructure IPFS data.
        const {ticketID, eventID, ticketSignature} = ipfsResponse.ipfsResponse.ticketData;

        /* VALIDATION */

        // Validate transaction hash in LUT.
        const lutResponse = await FirebaseInterface.validateTxHash(ticketID, txReceipt);

        // Handle lut lookup error.
        if(lutResponse.verdict === null){
            const validationSummary = {
                passOwnershipStatus: false,
                passOwnershipVerdict: null,
                message: lutResponse.message,
                validationResponse: null,
                validationHistoryResponse: null,
                result: null
            }
            return response.status(500).send(validationSummary);
        } else if (lutResponse.verdict === false ){
            // Handle invalid request.
            const validationSummary = {
                passOwnershipStatus: true,
                passOwnershipVerdict: false,
                message: lutResponse.message,
                validationResponse: null,
                validationHistoryResponse: null,
                result: null
            }
            return response.status(403).send(validationSummary);
        }

        // Progress if transaction hash valid.

        // Validate current ownership.
        const validationResponse = await BlockchainInterface.validationProtocol(txReceipt, ticketID, ticketSignature, eventID, currentUserID);

        // Check for validation error or invalid ownership log.
        if(validationResponse.verdict === null){
            const ownershipPassSummary = {
                passOwnershipStatus: false,
                passOwnershipVerdict: null,
                message: validationResponse.message,
                validationResponse: validationResponse,
                validationHistoryResponse: null,
                result: null
            }
            return response.status(500).send(ownershipPassSummary);
        } else if (validationResponse.verdict === false){
            const ownershipPassSummary = {
                passOwnershipStatus: true,
                passOwnershipVerdict: false,
                message: validationResponse.message,
                validationResponse: validationResponse,
                validationHistoryResponse: null,
                result: null
            }
            return response.status(403).send(ownershipPassSummary);
        }

        // Once validated, validate ownership history.
        const validationHistoryResponse = await BlockchainInterface.validateHistory(txReceipt, ticketSignature, currentUserID);

        // Check for errors.
        if(validationHistoryResponse.verdict === null){
            const ownershipPassSummary = {
                passOwnershipStatus: false,
                passOwnershipVerdict: null,
                message: validationHistoryResponse.message,
                validationResponse: validationResponse,
                validationHistoryResponse: validationHistoryResponse,
                result: null
            }
            return response.status(500).send(ownershipPassSummary);
        } else if(validationHistoryResponse.verdict === false){
            const ownershipPassSummary = {
                passOwnershipStatus: true,
                passOwnershipVerdict: false,
                message: validationResponse.message,
                validationResponse: validationResponse,
                validationHistoryResponse: validationHistoryResponse,
                result: null
            }
            return response.status(403).send(ownershipPassSummary);
        }

        /* PASS OWNERSHIP */

        // Once all validation cleared, create new ownership log with new user.
        const newOwnershipLog = await BlockchainInterface.logOwnership(
            ticketID,
            eventID,
            newUserID, 
            currentUserID,
            txReceipt
        )

        // Check for errors.
        if(newOwnershipLog.txReceipt === null){
            const ownershipPassSummary = {
                passOwnershipStatus: false,
                passOwnershipVerdict: null,
                message: newOwnershipLog.message,
                validationResponse: validationResponse,
                validationHistoryResponse: validationHistoryResponse,
                result: null
            }
            return response.status(500).send(ownershipPassSummary);
        }

        // Update LUT.
        const lutResponsePass = await FirebaseInterface.recordTicketLUT(
            ticketID,
            newOwnershipLog.txReceipt
        )

        // Return successfully with details of new ownership.
        const ownershipPassSummary = {
            passOwnershipStatus: true,
            passOwnershipVerdict: true,
            message: "New user successfully logged.",
            validationResponse: validationResponse,
            validationHistoryResponse: validationHistoryResponse,
            result: {
                newUserID: newUserID,
                prevUserID: currentUserID,
                newTxHash: newOwnershipLog.txReceipt,
                prevTxHash: txReceipt,
                cid: cid
            }
        }

        return response.status(201).send(ownershipPassSummary);

    } else {
        // If blockchain interface is offline begin restoration.
        await BlockchainInterface.restoreConnection();
        const ownershipPassSummary = {
            passOwnershipStatus: false,
            passOwnershipVerdict: null,
            message: "Blockchain interface offline, unable to validate ticket.",
            validationResponse: null,
            validationHistoryResponse: null,
            result: null
        }
        return response.status(503).send(ownershipPassSummary);
    }
})

/**
 * This endpoint executes the validation protocol, 
 * for a single transaction error sates and invalid 
 * requests are handled accordingly.
 */
app.post('/validate', async(request, response) => {

    // Obtain data payload from request body.
    const payload = request.body;
    const {userID, cid, txReceipt, currentEventID} = await payload;

    // Check if blockchain interface is online.
    if(BlockchainInterface.connectionStatus){

        /* PULL IPFS DATA */

        // Fetch ticket information from IPFS.
        const ipfsResponse = await IpfsInterface.pull(cid);

        // Check for IPFS error.
        if(ipfsResponse.ipfsResponse === null || ipfsResponse.ipfsResponse === undefined){
            // Handle invalid IPFS data request.
            if(ipfsResponse.serverError === "Invalid IPFS Gatsby Token."){
                const validationSummary = {
                    validationStatus: true,
                    validationVerdict: false,
                    message: 'Invalid IPFS Gatsby Token.',
                    validationResponse: null
                }
                return response.status(403).send(validationSummary);
            } else {
                // Handle internal server error.
                const validationSummary = {
                    validationStatus: false,
                    validationVerdict: null,
                    message: 'Unable to pull IPFS data.',
                    validationResponse: null
                }
                return response.status(500).send(validationSummary);
            }
        }

        // Destructure IPFS data.
        const {ticketID, eventID, ticketSignature} = ipfsResponse.ipfsResponse.ticketData;

        // Check if ticket event ID matches current request.
        if(currentEventID !== eventID){
            const validationSummary = {
                validationStatus: true,
                validationVerdict: false,
                message: 'Current event does not match ticket information.',
                validationResponse: null
            }
            return response.status(400).send(validationSummary);
        }

        /* VALIDATION PROTOCOL */

        // Validate transaction hash in LUT.
        const lutResponse = await FirebaseInterface.validateTxHash(ticketID, txReceipt);

        // Handle lut lookup error.
        if(lutResponse.verdict === null){
            const validationSummary = {
                validationStatus: false,
                validationVerdict: null,
                message: lutResponse.message,
                validationResponse: null
            }
            return response.status(500).send(validationSummary);
        } else if (lutResponse.code === 2){
            // Handle invalid request.
            const validationSummary = {
                validationStatus: true,
                validationVerdict: false,
                message: lutResponse.message,
                validationResponse: null
            }
            return response.status(403).send(validationSummary);
        }

        // Progress if transaction hash valid.

        const validationResponse = await BlockchainInterface.validationProtocol(txReceipt, ticketID, ticketSignature, eventID, userID);

        // Check for validation error.
        if(validationResponse.verdict === null){
            const validationSummary = {
                validationStatus: false,
                validationVerdict: null,
                message: validationResponse.message,
                validationResponse: null
            }
            return response.status(500).send(validationSummary);
        }

        // Return response from validation sequence.
        if(validationResponse.verdict === true){
            // Mark ticket as validated.
            const lutUpdateResponse = await FirebaseInterface.markTicketAsValidated(ticketID);

            const validationSummary = {
                validationStatus: true,
                validationVerdict: true,
                message: validationResponse.message,
                validationResponse: validationResponse
            }
            return response.status(200).send(validationSummary);
        } else {
            const validationSummary = {
                validationStatus: true,
                validationVerdict: false,
                message: validationResponse.message,
                validationResponse: validationResponse
            }
            return response.status(403).send(validationSummary);
        }

    } else {
        // If blockchain interface is offline begin restoration.
        await BlockchainInterface.restoreConnection();
        const protocolSummary = {
            validationStatus: false,
            validationVerdict: null,
            message: "Blockchain interface offline, unable to validate ticket.",
            validationResponse: null
        }
        return response.status(503).send(protocolSummary);
    }
});

/*** SERVER START ***/

/**
 * Initialise Blockchain Interface for client interactions.
 * 
 * Start server, listen on specified port.
 */
app.listen(port, async () => {
    // Initialise blockchain interface.
    const {initialisationStatus} =  await BlockchainInterface.initialiseInterface();
    if(!initialisationStatus){
        BlockchainInterface.restoreConnection();
    }

    // Initialise firebase interface.
    const FirebaseInit = FirebaseInterface.initialiseInterface();
    if(FirebaseInit === false){
        FirebaseInterface.restoreConnection();
    }

    console.log(`Client API listening on port: ${port}`);
})


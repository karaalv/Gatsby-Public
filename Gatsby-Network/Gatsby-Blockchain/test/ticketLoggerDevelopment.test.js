/******** TRUFFLE TEST ENVIRONMENT ********/

// Import environment variables.
require('dotenv').config({path: '../../../.env'});

/******** TEST DATA ********/

const TEST_TICKET_ID = 'TICKET_ID';
const TEST_EVENT_ID = 'EVENT_ID';
const TEST_USER_ID = 'ALVIN';
const TEST_PREVUSER_ID = 'GATSBY';
const TEST_PREVTX = 'PREVTX';

/******** TEST CLASSES ********/
const ticketLogger = artifacts.require("TicketLogger");

/******** TEST SCRIPTS ********/
contract("TicketLogger", (accounts) =>{
    // Test 1.
    it("Should emit event showing ticket ownership log.", async() => {
        const ticketLoggerInstance = await ticketLogger.deployed();
        const masterAccount = accounts[0];

        // Interact with ticket contract.
        const result = await ticketLoggerInstance.logTicketOwnership(
            TEST_TICKET_ID, 
            TEST_EVENT_ID, 
            TEST_USER_ID, 
            TEST_PREVUSER_ID, 
            TEST_PREVTX,
            {
                from: masterAccount
            }
        );

        // Destructure log data.
        const {ticketID, eventID, userID, prevUserID, prevTxHash} = result.logs[0].args;

        assert.equal(ticketID, TEST_TICKET_ID, "Incorrect ticket ID.");
        assert.equal(eventID, TEST_EVENT_ID, "Incorrect event ID."); 
        assert.equal(userID, TEST_USER_ID, "Incorrect user ID."); 
        assert.equal(prevUserID, TEST_PREVUSER_ID, "Incorrect previous user ID."); 
        assert.equal(prevTxHash, TEST_PREVTX, "Incorrect previous transaction hash.");  
    });
    // Test 2.
    it("Should throw error when invalid address calls contract.", async () =>{
        const ticketLoggerInstance = await ticketLogger.deployed();        
        /**
        * During testing the first account is used to deploy 
        * the contract and becomes owner, for tests this is
        * the owner account.
        */
       const masterAccount = accounts[0];
       const invalidAddress = accounts[1];
       let error;

        // Interact with ticket contract.
        try{
            const result = await ticketLoggerInstance.logTicketOwnership(
                TEST_TICKET_ID, 
                TEST_EVENT_ID, 
                TEST_USER_ID, 
                TEST_PREVUSER_ID, 
                TEST_PREVTX,
                {
                    from: invalidAddress
                }
            );
            error = null;
        } catch(err) {
            error = err;
        }

        const result = await ticketLoggerInstance.logTicketOwnership(
            TEST_TICKET_ID, 
            TEST_EVENT_ID, 
            TEST_USER_ID, 
            TEST_PREVUSER_ID, 
            TEST_PREVTX,
            {
                from: masterAccount
            }
        );
        
        assert.ok(result, "Owner address was not able to access contract.");        
        assert.ok(error, "No error was raised.");
    });
});



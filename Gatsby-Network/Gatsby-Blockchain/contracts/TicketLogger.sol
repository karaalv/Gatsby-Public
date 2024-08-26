// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0;

contract TicketLogger{

    // Address of contract owner.
    address private immutable owner; 

    /**
     * Event used to indicate ticket ownership.
     */
    event TicketOwnership(
        string ticketID,
        string eventID,
        string userID,
        string prevUserID,
        string prevTxHash
    );

    event newTicketLogger(
        address contractAddress
    );

    constructor(){
        // Initialise owner address.
        owner = msg.sender;
        emit newTicketLogger(address(this));
    }

    /**
     * Function modifier to give access control, 
     * only the address that created the contract
     * can access its functions.
     */
    modifier accessControl(){
        require(
            msg.sender == owner, 
            "Invalid address, only owner can interact with contract."
        );
        _;
    }

    /**
     * Function used to emit ownership log on transaction.
     */
    function logTicketOwnership(
            string calldata ticketID, 
            string calldata eventID, 
            string calldata userID,
            string calldata prevUserID,
            string calldata prevTxHash
        ) public accessControl{

        // Emit event.
        emit TicketOwnership(ticketID, eventID, userID, prevUserID, prevTxHash);
    }
}
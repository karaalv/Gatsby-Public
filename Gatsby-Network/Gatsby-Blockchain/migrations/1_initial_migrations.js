/****** SMART CONTRACT DEPLOYMENT SCRIPT ******/ 

/**
 * Require artefacts of smart contracts to 
 * deploy.
 */
const TicketLogger = artifacts.require("TicketLogger");

/**
 * Deployment of smart contracts.
 * @param {*} deployer 
 */
module.exports = function(deployer){
    deployer.deploy(TicketLogger);
}
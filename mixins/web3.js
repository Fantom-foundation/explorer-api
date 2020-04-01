const config = require(`config`);
const Web3 = require('web3');

console.log("config.rpcPort", config.rpcPort);
module.exports = new Web3(
    new Web3.providers.WebsocketProvider(`ws://${config.nodeAddr}:${config.wsPort}`)
    // new Web3.providers.HttpProvider(`http://localhost:18545`)
);
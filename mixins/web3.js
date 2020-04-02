const config = require(`config`);
const Web3 = require('web3');

module.exports = new Web3(
    new Web3.providers.WebsocketProvider(`ws://${config.nodeAddr}:${config.wsPort}`)
);
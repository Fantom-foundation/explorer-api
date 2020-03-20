const config = require('config');

const web3 = require('./web3');

const sfcAbi = require('./abi').stakers;
const contractsAddresses = config.get('contractsAddresses');
const sfc = new web3.eth.Contract(sfcAbi, contractsAddresses.sfc);

module.exports = {
    getStakerMetadata: async (stkrId) => {
        try {
            let metaData = await sfc.methods.stakerMetadata(stkrId).call();

            if (!metaData) {
                return {};
            }

            metaData = web3.utils.hexToUtf8(metaData);
            metaData = JSON.parse(metaData);

            return metaData;
        } catch (err) {
            console.log(err);
            return {};
        }
    },        
}
const config = require('config');
const web3 = require('./web3');

const sfcAbi = require('./abi').stakers;
const contractsAddresses = config.get('contractsAddresses');
const sfc = new web3.eth.Contract(sfcAbi, contractsAddresses.sfc);

function queryCallback(errorMsg) {
    return function (error, result) {
        if (!error) {
            return result;
        } else {
            console.log(errorMsg, error);
        }
    }
}

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

    calcValidatorRewards: async (stkrId, calcRewardsStartEpoch, epochNum) => {
        let rewards = await sfc.methods.calcValidatorRewards(stkrId, calcRewardsStartEpoch, epochNum).call({}, queryCallback("calcValidatorRewards error:"));
        return rewards;
    },

    getEpochSnapshot: async (epoch) => {
        let snapshot = await sfc.methods.epochSnapshots(epoch).call({}, queryCallback("getEpochSnapshot error:"));
        return snapshot;
    },

    getCurrentEpoch: async () => {
        let currentEpochRes = await sfc.methods.currentEpoch().call({}, queryCallback("getCurrentEpoch error:"));
        return currentEpochRes;
    },

    stakers: async (stkrId) => {
        let staker = await sfc.methods.stakers(stkrId).call({}, queryCallback("stakers error:"));
        return staker;
    },
}

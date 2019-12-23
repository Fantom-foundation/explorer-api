const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const fantomRPC = require('../../../../mixins/fantomRPC');
const utils = require('web3-utils');

module.exports = async (req, res, next) => {
  try {          
    const epochStats = await fantomRPC({ 
      method: `eth_getEpochStats`, 
      params: ['latest'], 
      id: 1 //required by fantom node rpc-api, intended for request accounting (this ability not using now)
    });

    if (epochStats.error) {
      console.log(epochStats.error);
      throw new Error(epochStats.error.message);
    }    
    
    const epochNumber = utils.hexToNumberString(epochStats.result.epoch);
    const totalTxFee = utils.hexToNumberString(epochStats.result.totalFee);
    const totalBaseRewardWeight = utils.hexToNumberString(epochStats.result.totalBaseRewardWeight);
    const totalTxRewardWeight = utils.hexToNumberString(epochStats.result.totalTxRewardWeight);
    let duration;  

    const result = {
      epochNumber,
      totalTxFee,
      totalBaseRewardWeight,
      totalTxRewardWeight
    };
    
    if (epochStats.result.end){
      // converting unixNano to timestamp
      let end = parseInt(epochStats.result.end, 16);
      end = end / 1000000;
      end = Math.floor(end);

      let start = parseInt(epochStats.result.start, 16);
      start = start / 1000000;
      start = Math.floor(start);
      //

      duration = end - start;

      result.endTime = new Date(end);
      result.duration = duration;
    }

    return res.json(okResp(result));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
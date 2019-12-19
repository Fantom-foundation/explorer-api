const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const fantomRPC = require('../../../../mixins/fantomRPC');

module.exports = async (req, res, next) => {
  try {          
    const getEpochStatsPromise = fantomRPC({ 
      method: `eth_getEpochStats`, 
      params: ['latest'], 
      id: 1 //required by fantom node rpc-api, intended for request accounting (this ability not using now)
    });

    const getStakersPromise = fantomRPC({ 
      method: `sfc_getStakers`, 
      params:["0x2"],
      id: 1
    });

    let epochStats, stakers;

    await Promise.all([
      getEpochStatsPromise,
      getStakersPromise
    ])
    .then(result => {
      epochStats = result[0];
      stakers = result[1];
    });

    if (epochStats.error || stakers.error) {
      const errors = [];
      if (epochStats.error) errors.push(epochStats.error);
      if (stakers.error) errors.push(stakers.error);
      throw new Error({ errors });
    }    
    
    const epochNumber = parseInt(epochStats.result.epoch, 16);
    const totalTxFee = parseInt(epochStats.result.totalFee, 16);
    let validatingPower = 0;  
    let duration;  

    stakers.result.forEach(staker => {
      validatingPower += parseInt(staker.validatingPower, 16);
    })

    const result = {
      epochNumber,
      totalTxFee,
      validatingPower
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
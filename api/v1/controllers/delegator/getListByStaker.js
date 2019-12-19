const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const fantomRPC = require('../../../../mixins/fantomRPC');
const hexFieldsToDecimals = require('../../../../mixins/nodeRawRpcHexFieldsToDecimals');

module.exports = async (req, res, next) => {
  try {          
    const method = `sfc_getDelegatorsOf`;  
    const staker = req.processedStaker;

    const verbosity = req.query.verbosity ? req.query.verbosity : 0;
    const verbosityHex = `0x` + verbosity.toString(16);
    // Verbosity. 
    // Number. If 0, then include only addresses. 
    // If >= 1, then include base fields. 
    // If >= 2, then include metrics.

    const params = [staker, verbosityHex];     
    const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
    const list = await fantomRPC({ method, params, id: reqId });

    if (list.error) {
      throw new Error(list.error.message);
    }  

    if (verbosity != 0){
      list.result.forEach(obj=> {
        hexFieldsToDecimals(obj);
      })
    }

    return res.json(okResp({ delegators: list.result }));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
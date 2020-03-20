const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const fantomRPC = require('../../../../mixins/fantomRPC');
const hexFieldsToDecimals = require('../../../../mixins/nodeRawRpcHexFieldsToDecimals');
const contractsMethods = require('../../../../mixins/contractsMethods');

module.exports = async (req, res, next) => {
  try {          
    const method = `sfc_getStakers`;
    
    const verbosity = req.query.verbosity ? req.query.verbosity : 0;
    const verbosityHex = `0x` + verbosity.toString(16);
    // verbosity: 
    // If 0, then include only stakerIDs. 
    // If >= 1, then include base field. 
    // If >= 2, then include metrics (including downtime if validator). 
    
    const params = [verbosityHex];         
    const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
    const list = await fantomRPC({ method, params, id: reqId });

    if (list.error) {
      throw new Error(list.error.message);
    }  

    const metadataPromises = [];

    list.result.forEach(obj=> {
      hexFieldsToDecimals(obj);
      metadataPromises.push(contractsMethods.getStakerMetadata(obj.id));
    });

    await Promise.all(metadataPromises).then(metadataArr => {
      list.result.forEach((obj, i) => obj.metadata = metadataArr[i]);
    });

    return res.json(okResp({ stakers: list.result }));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const hexFieldsToDecimals = require('../../../../mixins/nodeRawRpcHexFieldsToDecimals');
const contractsMethods = require('../../../../mixins/contractsMethods');

module.exports = async (req, res, next) => {
  try {          
    hexFieldsToDecimals(req.foundStaker);
    req.foundStaker.metadata = await contractsMethods.getStakerMetadata(req.foundStaker.id);

    return res.json(okResp(req.foundStaker));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
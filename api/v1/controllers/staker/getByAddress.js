const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const hexFieldsToDecimals = require('../../../../mixins/nodeRawRpcHexFieldsToDecimals');

module.exports = async (req, res, next) => {
  try {          
    hexFieldsToDecimals(req.foundStaker);
    return res.json(okResp(req.foundStaker));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
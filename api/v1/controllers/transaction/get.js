const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');

module.exports = async (req, res, next) => {
  try {          
    return res.json(okResp({ transaction: req.foundTrx }));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
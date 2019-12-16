const errors = require('../../../mixins/errors');
const okResp = require('../../../mixins/okResponseConstructor');
const fantomRPC = require('../../../mixins/fantomRPC');

module.exports = async (req, res, next) => {
  try {          
    const { method, params, id } = req.body;
    const rpcRes = await fantomRPC({ method, params, id });

    const result = okResp(
      rpcRes,
      rpcRes.error ? false : true
    );

    return res.json(result);
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
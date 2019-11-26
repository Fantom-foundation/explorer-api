const errors = require('../../../mixins/errors');
const okResp = require('../../../mixins/okResponseConstructor');
const { Block, Transaction } = require('../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let count = req.query.count ? req.query.count : 10;

    const blocks = await Block.find().select('-_id').sort({ number: -1 }).limit(count);
    const transactions = await Transaction.find().select('-_id').sort({ timestamp: -1 }).limit(count);
    const data = { 
      blocks,
      transactions 
    }

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
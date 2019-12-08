const errors = require('../../../mixins/errors');
const okResp = require('../../../mixins/okResponseConstructor');
const { Block, Transaction } = require('../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let count = req.query.count ? req.query.count : 10;
    
    let lastBlock, maxBlockHeight, blocks, transactions;

    await Promise.all([
      Block.findOne().select('number').sort('-number'),
      Block.find().select('-_id').sort({ number: -1 }).limit(count),
      Transaction.find().select('-_id').sort({ globalIndex: -1 }).limit(count)
    ])
    .then(result => {
      lastBlock = result[0];
      blocks = result[1];
      transactions = result[2];
    });
    
    if (lastBlock) maxBlockHeight = lastBlock.number;

    const data = { 
      maxBlockHeight,
      count,
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
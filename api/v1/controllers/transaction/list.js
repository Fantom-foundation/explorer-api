const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Transaction, Block } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, order, block, from, to, contractCreation, contractAddress } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;
    if (!order) order = -1;

    const query = {};

    if (block >= 0) query.blockNumber = block;
    if (req.foundFrom) query.from = from;
    if (req.foundTo) query.to = to;
    if (typeof contractCreation === 'boolean' && contractCreation === true) query.contractAddress = { $ne: null };
    if (typeof contractCreation === 'boolean' && contractCreation === false) query.contractAddress = null;
    if (req.foundContract) query.contractAddress = contractAddress;

    let lastBlock, maxBlockHeight, total, transactions;

    await Promise.all([
      Block.findOne().select('number').sort('-number'),
      Transaction.countDocuments(query),
      Transaction.find(query).select('-_id').sort({ globalIndex: order }).skip(offset).limit(count)
    ])
    .then(result => {
      lastBlock = result[0];
      total = result[1];
      transactions = result[2];
    });
    
    if (lastBlock) maxBlockHeight = lastBlock.number;

    const data = { 
      maxBlockHeight,
      total, 
      offset, 
      count, 
      transactions 
    }

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
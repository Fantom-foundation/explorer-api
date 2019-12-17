const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Block } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, order } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;
    if (!order) order = -1;

    let lastBlock, maxBlockHeight, total, blocks;

    await Promise.all([
      Block.findOne().select('number').sort('-number'),
      Block.countDocuments(),
      Block.find().select('-_id -__v').sort({ number: order }).skip(offset).limit(count)
    ])
    .then(result => {
      lastBlock = result[0];
      total = result[1];
      blocks = result[2];
    });
    
    if (lastBlock) maxBlockHeight = lastBlock.number;
    
    const data = { 
      maxBlockHeight,
      total, 
      offset, 
      count, 
      blocks 
    }

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
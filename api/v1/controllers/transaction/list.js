const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Transaction } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, order } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;
    if (!order) order = -1;

    const total = await Transaction.countDocuments();
    const docs = await Transaction.find().select('-_id').sort({ timestamp: order }).skip(offset).limit(count);
    const data = { 
      total, 
      offset, 
      count, 
      docs 
    }

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
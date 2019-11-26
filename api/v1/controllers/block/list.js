const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Block } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, order } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;
    if (!order) order = -1;

    const total = await Block.countDocuments();
    const docs = await Block.find().select('-_id').sort({ number: order }).skip(offset).limit(count);
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
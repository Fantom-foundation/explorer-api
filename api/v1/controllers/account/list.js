const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Account } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, order } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;
    if (!order) order = -1;

    let total, accounts;

    await Promise.all([
      Account.countDocuments(),
      Account.find().select('-_id').skip(offset).limit(count)
    ])
    .then(result => {
      total = result[0];
      accounts = result[1];
    });
    
    const data = { 
      total, 
      offset, 
      count, 
      accounts 
    }

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
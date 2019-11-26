const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Transaction } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;

    const account = { ...req.foundAccount };
    const addr = account.address;

    const totalTrxs = await Transaction.countDocuments();
    const trxs = await Transaction.find().select('hash from to nonce timestamp value').sort('-nonce').skip(offset).limit(count);
    const data = { 
      ...account,
      nonce: trxs.length ? trxs[0].nonce : undefined,
      totalTrxs, 
      offsetTrxs: offset, 
      countTrxs: count, 
      transactions: trxs 
    };

    return res.json(okResp(data));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
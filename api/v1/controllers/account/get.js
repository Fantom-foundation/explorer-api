const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const { Transaction } = require('../../../../db.js');

module.exports = async (req, res, next) => {
  try {          
    let { offset, count, trxsFilter } = req.query;

    if (!offset) offset = 0;
    if (!count) count = 10;

    const account = { ...req.foundAccount };
    const addr = account.address;

    let trxsQuery;
    if (trxsFilter === 'from') trxsQuery = { from: addr };
    else if (trxsFilter === 'to') trxsQuery = { to: addr };
    else trxsQuery = { $or:[{ from: addr }, { to: addr }] };

    let totalTrxs, lastTrx, trxs;
    
    await Promise.all([
      Transaction.countDocuments(trxsQuery),
      Transaction.findOne({ $or:[{ from: addr }, { to: addr }] }).select('nonce').sort('-timestamp'),
      Transaction.find(trxsQuery).select('-_id hash from to nonce timestamp value fee gasUsed gasPrice').sort('-timestamp').skip(offset).limit(count)
    ])
    .then(result => {
      totalTrxs = result[0];
      lastTrx = result[1];
      trxs = result[2];
    });

    const data = { 
      ...account,
      nonce: lastTrx ? lastTrx.nonce : undefined,
      totalTrxs, 
      offsetTrxs: offset, 
      countTrxs: count, 
      transactions: trxs 
    };

    return res.json(okResp({ account: data }));
  }
  catch (err){
    console.log(err);
    next( errors.internalServerError );
  }
};
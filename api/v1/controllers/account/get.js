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

    /////////////////
    // Build query //
    /////////////////

    let trxsQuery = {
      $or: [],
      contractAddress: null // transactions for contract creation not included in query by default
    };

    if (trxsFilter) {

      // contractAddress is not null if the transaction was a contract creation
      if (trxsFilter.indexOf('contract') != -1){
        trxsQuery.contractAddress = { $ne: null };
      }
      
      if (trxsFilter.indexOf('from') != -1){
        trxsQuery.$or.push({ from: addr });
      }

      if (trxsFilter.indexOf('to') != -1){
        trxsQuery.$or.push({ to: addr });
      }

    }
    
    if (
      !trxsFilter || 
      trxsFilter && trxsFilter.indexOf('from') == -1 && trxsFilter.indexOf('to') == -1
    ){
      trxsQuery.$or.push({ from: addr });
      trxsQuery.$or.push({ to: addr });
    }

    /////////////////

    let totalTrxs, lastTrx, trxs;
    
    await Promise.all([
      Transaction.countDocuments(trxsQuery),
      Transaction.findOne({ $or:[{ from: addr }] }).select('nonce').sort('-nonce'),
      Transaction.find(trxsQuery).select('-_id hash from to nonce timestamp value fee gasUsed gasPrice contractAddress').sort('-globalIndex').skip(offset).limit(count)
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
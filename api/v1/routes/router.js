const express = require('express');
const router = express.Router();

/////////////////
// controllers //
/////////////////

//block
const getBlock = require('../controllers/block/get.js');
const getBlocks = require('../controllers/block/list.js');

// transaction
const getTransaction = require('../controllers/transaction/get.js');
const getTransactions = require('../controllers/transaction/list.js');

// account
const getAccount = require('../controllers/account/get.js');
const getAccounts = require('../controllers/account/list.js');

// delegator
const getDelegator = require('../controllers/delegator/get.js');
const getDelegatorsByStaker = require('../controllers/delegator/getListByStaker.js');

// staker
const getStakerByAddress = require('../controllers/staker/getByAddress.js');
const getStakerById = require('../controllers/staker/getById.js');
const getStakerDowntime = require('../controllers/staker/getDowntime.js');
const getStakerOriginationScore = require('../controllers/staker/getOriginationScore.js');
const getStakerPoi = require('../controllers/staker/getPoi.js');
const getStakerRoi = require('../controllers/staker/getRoi.js');
const getStakerValidationScore = require('../controllers/staker/getValidationScore.js');
const getStakerRewardWeights = require('../controllers/staker/getRewardWeights');
const getStakerList = require('../controllers/staker/list.js');

// epoch
const getEpochLatest = require('../controllers/epoch/latest.js');

// misc
const getLatestData = require('../controllers/get-latest-data.js');

// dev
const rpc = require('../controllers/rpc.js');

////////////////
// validators //
////////////////

const validBlock = require('../middlewares/validators/block.js');
const validTrx = require('../middlewares/validators/transaction.js');
const validAccount = require('../middlewares/validators/account.js');
const validLatestData = require('../middlewares/validators/latestData.js');
const validStaker = require('../middlewares/validators/staker.js');
const validDelegator = require('../middlewares/validators/delegator.js');
const validRPC = require('../middlewares/validators/rpc.js');

////////////
// routes //
////////////

// block
router.get('/get-block', validBlock.get(), getBlock);
router.get('/get-blocks', validBlock.list(), getBlocks);

// transaction
router.get('/get-transaction', validTrx.get(), getTransaction);
router.get('/get-transactions', validTrx.list(), getTransactions);

// account
router.get('/get-account', validAccount.get(), getAccount);
router.get('/get-accounts', validAccount.list(), getAccounts);

// delegator
router.get('/delegator/address/:address', validDelegator.get(), getDelegator);
router.get('/delegator/staker/:id', validDelegator.getListByStaker(), getDelegatorsByStaker);

// staker
router.get('/staker/address/:address', validStaker.getByAddress(), getStakerByAddress);
router.get('/staker/id/:id', validStaker.getById(), getStakerById);
router.get('/staker/id/:id/downtime', validStaker.getDowntime(), getStakerDowntime);
router.get('/staker/id/:id/origination-score', validStaker.getOriginationScore(), getStakerOriginationScore);
router.get('/staker/id/:id/poi', validStaker.getPoi(), getStakerPoi);
router.get('/staker/id/:id/roi/:epochsNum', validStaker.getRoi(), getStakerRoi);
router.get('/staker/id/:id/validation-score', validStaker.getValidationScore(), getStakerValidationScore);
router.get('/staker/id/:id/reward-weights', validStaker.getRewardWeights(), getStakerRewardWeights);
router.get('/staker/', validStaker.list(), getStakerList);

// epoch
router.get('/epoch/latest', getEpochLatest);

// misc
router.get('/get-latest-data', validLatestData.get(), getLatestData);

// dev
if (process.env.NODE_ENV == `development`){
router.post('/rpc', validRPC.post(), rpc);
}

module.exports = router;
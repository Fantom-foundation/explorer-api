const express = require('express');
const router = express.Router();

/////////////
// require //
/////////////

// controllers

const getBlock = require('../controllers/block/get.js');
const getBlocks = require('../controllers/block/list.js');

const getTransaction = require('../controllers/transaction/get.js');
const getTransactions = require('../controllers/transaction/list.js');

const getAccount = require('../controllers/account/get.js');
const getAccounts = require('../controllers/account/list.js');

const getLatestData = require('../controllers/get-latest-data.js');
const rpc = require('../controllers/rpc.js');

// validators

const validBlock = require('../middlewares/validators/block.js');
const validTrx = require('../middlewares/validators/transaction.js');
const validAccount = require('../middlewares/validators/account.js');
const validLatestData = require('../middlewares/validators/latestData.js');
const validRPC = require('../middlewares/validators/rpc.js');

////////////
// routes //
////////////

router.get('/get-block', validBlock.get(), getBlock);
router.get('/get-blocks', validBlock.list(), getBlocks);

router.get('/get-transaction', validTrx.get(), getTransaction);
router.get('/get-transactions', validTrx.list(), getTransactions);

router.get('/get-account', validAccount.get(), getAccount);
router.get('/get-accounts', validAccount.list(), getAccounts);

router.get('/get-latest-data', validLatestData.get(), getLatestData);
router.post('/rpc', validRPC.post(), rpc);

module.exports = router;
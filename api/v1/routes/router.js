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

const getLatestData = require('../controllers/get-latest-data.js');

// validators

const validBlock = require('../middlewares/validators/block.js');
const validTrx = require('../middlewares/validators/transaction.js');
const validAccount = require('../middlewares/validators/account.js');
const validLatestData = require('../middlewares/validators/latestData.js');

////////////
// routes //
////////////

router.get('/get-block', validBlock.get(), getBlock);
router.get('/get-blocks', validBlock.list(), getBlocks);

router.get('/get-transaction', validTrx.get(), getTransaction);
router.get('/get-transactions', validTrx.list(), getTransactions);

router.get('/get-account', validAccount.get(), getAccount);

router.get('/get-latest-data', validLatestData.get(), getLatestData);

module.exports = router;
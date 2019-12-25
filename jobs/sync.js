/////////////////////////////////////////////////////////////////////
// Following code taken from Ethereumclassic explorer and modified //
/////////////////////////////////////////////////////////////////////
require('../db.js');

const config = require(`config`);

const blockMethods = require('./methods/blockMethods');
const syncMethods = require('./methods/syncMethods');
const patcherMethods = require('./methods/patcherMethods');
const marketMethods = require('./methods/marketMethods');

/**
 * Patch missing blocks
 * not needed while Fantom node not supports `newHeads` subscription
 */
if (config.patch === true) {
    patcherMethods.runPatcher(config);
}

/**
 * Starts full sync
 */
if (config.syncAll === true) {
    syncMethods.syncChain(config);
}

/**
 * Start price sync on DB with interval
 */
const quoteInterval = 10 * 60 * 1000; // 10 minutes

if (config.settings.useFiat) {
    marketMethods.getQuote();

    setInterval(
        marketMethods.getQuote,
        quoteInterval
    );
}

/**
 * Get latest blocks with interval
 */
const getLatestBlocksInterval = config.get(`getLatestBlocksInterval`);
async function continiousFetchingLastBlocks() {
    await blockMethods.getLatest();
    setTimeout(
        async () => {
            continiousFetchingLastBlocks();
        }, 
        getLatestBlocksInterval
    );
}


try {
    blockMethods.listenLatest();
} catch (err) {
    console.log(`New blocks subscription error`);
    console.log(`Starting forced fetching last blocks`);
    continiousFetchingLastBlocks();    
}
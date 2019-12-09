const web3 = require('../../mixins/web3');
const blockMethods = require('./blockMethods');
const trxMethods = require('./trxMethods');
const { Block } = require('../../db.js');

/**
 * If full sync is checked this function will start syncing the block chain from lastSynced param see README
 */
const syncChain = function(config, nextBlock) {
    try {
        if (typeof nextBlock === 'undefined') {
            prepareSync(config, (error, startBlock) => {
                if (error) {
                    return;
                }
                syncChain(config, startBlock);
            });
            return;
        }

        if (nextBlock === null) {
            console.log('nextBlock is null');
            return;
        }
        if (nextBlock < config.startBlock) {
            blockMethods.writeToDB(config, null, true);
            trxMethods.writeManyToDB(config, null, true);
            console.log('*** Sync Finsihed ***');
            config.syncAll = false;
            return;
        }

        let count = config.bulkSize;
        while (nextBlock >= config.startBlock && count > 0) {
            web3.eth.getBlock(nextBlock, true, (error, blockData) => {
                if (error) {
                    console.log(`Warning (syncChain): error on getting block with hash/number: ${nextBlock}: ${error}`);
                } else if (blockData === null) {
                    console.log(`Warning: null block data received from the block with hash/number: ${nextBlock}`);
                } else {
                    blockMethods.writeToDB(config, blockData);
                    trxMethods.writeManyToDB(config, blockData);
                }
            });
            nextBlock--;
            count--;
        }

        setTimeout(() => {
            console.log(`syncChain, next block: ${nextBlock}`);
            syncChain(config, nextBlock);
        }, 500);
    } catch (err) {
        console.log(err);
        syncChain(config, nextBlock);
    }
};

/**
 * check oldest block or starting block then callback
 */
const prepareSync = async(config, callback) => {
    let blockNumber = null;
    const oldBlockFind = Block.find({}, 'number').lean(true).sort('number').limit(1);
    oldBlockFind.exec(async(err, docs) => {
        if (err || !docs || docs.length < 1) {
            // not found in db. sync from config.endBlock or 'latest'
            try {
                const currentBlock = await web3.eth.getBlockNumber();
                const latestBlock = config.endBlock || currentBlock || 'latest';
                if (latestBlock === 'latest') {
                    web3.eth.getBlock(latestBlock, true, (error, blockData) => {
                        if (error) {
                            console.log(`Warning (prepareSync): error on getting block with hash/number: ${latestBlock}: ${error}`);
                        } else if (blockData === null) {
                            console.log(`Warning: null block data received from the block with hash/number: ${latestBlock}`);
                        } else {
                            console.log(`Starting block number = ${blockData.number}`);
                            if ('quiet' in config && config.quiet === true) {
                                console.log('Quiet mode enabled');
                            }
                            blockNumber = blockData.number - 1;
                            callback(null, blockNumber);
                        }
                    });
                } else {
                    console.log(`Starting block number = ${latestBlock}`);
                    if ('quiet' in config && config.quiet === true) {
                        console.log('Quiet mode enabled');
                    }
                    blockNumber = latestBlock - 1;
                    callback(null, blockNumber);
                }
            } catch (err) {
                console.log(err);
                callback(err, null);
            }
        } else {
            blockNumber = docs[0].number - 1;
            console.log(`Old block found. Starting block number = ${blockNumber}`);
            if ('quiet' in config && config.quiet === true) {
                console.log('Quiet mode enabled');
            }
            callback(null, blockNumber);
        }
    });
};

module.exports = {
    syncChain,
    prepareSync
}
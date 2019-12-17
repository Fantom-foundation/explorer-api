const config = require('config');

const web3 = require('../../mixins/web3');
const { Block } = require('../../db.js');
const trxMethods = require('./trxMethods');

const writeToDB = async(config, blockData, flush) => {
    const self = writeToDB;
    if (!self.bulkOps) {
        self.bulkOps = [];
    }
    if (blockData && blockData.number >= 0) {
        const block = {
            ...blockData
        }; // break object reference
        block.transactions = block.transactions.length;

        self.bulkOps.push(new Block(block));
        if (!config.has('quiet') || config.get('quiet') == false) {
            console.log(`\t- block #${blockData.number} inserted.`);
        }
    }

    if (flush && self.bulkOps.length > 0 || self.bulkOps.length >= config.bulkSize) {
        const bulk = self.bulkOps;
        self.bulkOps = [];
        if (bulk.length === 0) return;

        try {
            const blocks = await Block.insertMany(bulk);
            if (duplicate) console.log(`Duplicate inserted!`);
            if (!config.has('quiet') || config.get('quiet') == false) {
                console.log(`* ${blocks.length} blocks successfully written.`);
            }
        } catch (err) {
                if (err.code === 11000) {
                if (!config.has('quiet') || config.get('quiet') == false) {
                        console.log(`Skip: Duplicate DB key : ${err}`);
                    }
                } else {
                    console.log(`Error: Aborted due to error on DB: ${err}`);
                    process.exit(9);
                }
            }
    }
};

const getLatest = async() => {
    try {
        const blockNumber = await web3.eth.getBlockNumber();
        const missingBlocks = [];
        let tempBlockNumStorage;

        if (!blockNumber && blockNumber !== 0) {
            console.log('Warning! Something wrong with receiving block number:', blockNumber);
            return;
        }

        const isNotNew = await Block.findOne({
            number: blockNumber
        });
        const lastBlockInDB = await Block.findOne().select('number').sort('-number');

        if (isNotNew) {
            return;
        }

        /**
         * check if there is missing blocks between new block and last one in DB
         * then fetch missing blocks                  
         */

        if (process.env.TEST_ENV != `true` && lastBlockInDB && (blockNumber - lastBlockInDB.number) > 1) {
            tempBlockNumStorage = lastBlockInDB.number;

            while ((blockNumber - tempBlockNumStorage) > 1) {
                tempBlockNumStorage++;
                missingBlocks.push(tempBlockNumStorage);
            }

            missingBlocks.forEach(blockNumber => {
                fetchCertainBlockAndWriteToDB(blockNumber);
            })

            console.log(`new block: ${blockNumber}, last block in DB: ${lastBlockInDB.number}`);
            console.log(`missing blocks: ${missingBlocks}`);
        }
        ///////////////////////////////////////////////////////////////////////////

        /**
         * Fetch new block
         * 
         * If true, the returned block will contain all transactions as objects
         * if false it will only contains the transaction hashes.
         * 
         * Should be true
         */
        const blockData = await web3.eth.getBlock(blockNumber, true);

        if (process.env.TEST_ENV === `true`) {
            return blockData;
        }

        await writeToDB(config, blockData, true);
        trxMethods.writeManyToDB(config, blockData, true);
    } catch (err) {
        console.log(err);
    }
}

const fetchCertainBlockAndWriteToDB = async(blockNumber) => {
    const blockAlreadyExists = await Block.findOne({
        number: blockNumber
    });

    if (blockAlreadyExists) {
        if (!config.has('quiet') || config.get('quiet') == false) {
            console.log(`Block number: ${blockNumber} already exists in DB.`);
        }
        return;
    }

    const blockData = await web3.eth.getBlock(blockNumber, true);
    writeToDB(config, blockData, true);
    trxMethods.writeManyToDB(config, blockData, true);
}

module.exports = {
    writeToDB,
    getLatest,
    fetchCertainBlockAndWriteToDB
}
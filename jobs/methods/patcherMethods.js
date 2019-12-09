const web3 = require('../../mixins/web3');
const blockMethods = require('./blockMethods');
const trxMethods = require('./trxMethods');
const { Block } = require('../../db.js');

/**
  Block Patcher(experimental)
**/
const runPatcher = async(config, startBlock, endBlock) => {
    if (!web3) {
        console.log('Error: Web3 is not connected. Retrying connection shortly...');
        setTimeout(() => {
            runPatcher(config);
        }, 3000);
        return;
    }

    if (typeof startBlock === 'undefined' || typeof endBlock === 'undefined') {
        // get the last saved block
        const blockFind = Block.find({}, 'number').lean(true).sort('-number').limit(1);
        blockFind.exec(async(err, docs) => {
            if (err || !docs || docs.length < 1) {
                // no blocks found. terminate runPatcher()
                console.log('No need to patch blocks.');
                return;
            }

            const lastMissingBlock = docs[0].number + 1;
            const currentBlock = await web3.eth.getBlockNumber();
            runPatcher(config, lastMissingBlock, currentBlock - 1);
        });
        return;
    }

    const missingBlocks = endBlock - startBlock + 1;
    if (missingBlocks > 0) {
        if (!('quiet' in config && config.quiet === true)) {
            console.log(`Patching from #${startBlock} to #${endBlock}`);
        }
        let patchBlock = startBlock;
        let count = 0;
        while (count < config.patchBlocks && patchBlock <= endBlock) {
            if (!('quiet' in config && config.quiet === true)) {
                console.log(`Patching Block: ${patchBlock}`);
            }
            web3.eth.getBlock(patchBlock, true, (error, patchData) => {
                if (error) {
                    console.log(`Warning: error on getting block with hash/number: ${patchBlock}: ${error}`);
                } else if (patchData === null) {
                    console.log(`Warning: null block data received from the block with hash/number: ${patchBlock}`);
                } else {
                    checkBlockExistsInDBThenWrite(config, patchData);
                }
            });
            patchBlock++;
            count++;
        }
        // flush
        blockMethods.writeToDB(config, null, true);
        trxMethods.writeManyToDB(config, null, true);

        setTimeout(() => {
            runPatcher(config, patchBlock, endBlock);
        }, 1000);
    } else {
        // flush
        blockMethods.writeToDB(config, null, true);
        trxMethods.writeManyToDB(config, null, true);

        console.log('*** Block Patching Completed ***');
    }
};

/**
 * This will be used for the patcher(experimental)
 */
const checkBlockExistsInDBThenWrite = async(config, patchData, flush) => {
    const blockAlreadyExists = await Block.findOne({
        number: patchData.number
    });

    if (blockAlreadyExists) {
        if (!config.has('quiet') || config.get('quiet') == false) {
            console.log(`Block number: ${patchData.number} already exists in DB.`);
        }
        return;
    }

    blockMethods.writeToDB(config, patchData, flush);
    trxMethods.writeManyToDB(config, patchData, flush);
};

module.exports = {
    runPatcher,
    checkBlockExistsInDBThenWrite
}
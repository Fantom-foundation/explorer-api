const asyncL = require('async');
const ERC20ABI = require('human-standard-token-abi');

const web3 = require('../../mixins/web3');
const {
    Transaction,
    Account,
    Contract,
    TokenTransfer
} = require('../../db.js');
const ERC20_METHOD_DIC = {
    '0xa9059cbb': 'transfer',
    '0xa978501e': 'transferFrom'
};

const normalize = (txData, receipt, blockData) => {
    const tx = {
        blockHash: txData.blockHash,
        blockNumber: txData.blockNumber,
        from: txData.from.toLowerCase(),
        hash: txData.hash.toLowerCase(),
        value: txData.value,
        nonce: txData.nonce,
        r: txData.r,
        s: txData.s,
        v: txData.v,
        gas: txData.gas,
        gasUsed: receipt.gasUsed,
        gasPrice: String(txData.gasPrice),
        input: txData.input,
        transactionIndex: txData.transactionIndex,
        timestamp: blockData.timestamp,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        fee: String(receipt.gasUsed * txData.gasPrice),
        globalIndex: txData.globalIndex
    };

    if (receipt.status) {
        tx.status = receipt.status;
    }

    if (txData.to) {
        tx.to = txData.to.toLowerCase();
        return tx;
    }

    if (txData.creates) {
        tx.creates = txData.creates.toLowerCase();
        return tx;
    }

    if (receipt.contractAddress) {
        tx.creates = receipt.contractAddress.toLowerCase();
        tx.contractAddress = receipt.contractAddress;
    }

    return tx;
};

/**
  Break transactions out of blocks and write to DB
**/
const writeManyToDB = async(config, blockData, flush) => {
    const self = writeManyToDB;
    if (!self.bulkOps) {
        self.bulkOps = [];
        self.blocks = 0;
    }
    // save miner addresses
    if (!self.miners) {
        self.miners = [];
    }
    if (blockData) {
        self.miners.push({
            address: blockData.miner,
            blockNumber: blockData.number,
            type: 0
        });
    }
    if (blockData && blockData.transactions.length > 0) {

        ////////////////////////////////////////////////////
        // prepare to create global trx index for sorting //
        ////////////////////////////////////////////////////
        const trxsLength = blockData.transactions.length;
        const exponent = trxsLength.toString().length;
        const indexDivider = Math.pow(10, exponent);
        ////////////////////////////////////////////////////

        for (d in blockData.transactions) {
            const txData = blockData.transactions[d];
            txData.globalIndex = blockData.number + (txData.transactionIndex / indexDivider);
            const receipt = await web3.eth.getTransactionReceipt(txData.hash);
            const tx = await normalize(txData, receipt, blockData);
            // Contact creation tx, Event logs of internal transaction
            if (txData.input && txData.input.length > 2) {
                // Contact creation tx
                if (txData.to === null) {
                    // Support Parity & Geth case
                    if (txData.creates) {
                        contractAddress = txData.creates.toLowerCase();
                    } else {
                        contractAddress = receipt.contractAddress.toLowerCase();
                    }
                    const contractdb = {};
                    let isTokenContract = true;
                    const Token = new web3.eth.Contract(ERC20ABI, contractAddress);
                    contractdb.owner = txData.from;
                    contractdb.blockNumber = blockData.number;
                    contractdb.creationTransaction = txData.hash;
                    try {
                        const call = await web3.eth.call({
                            to: contractAddress,
                            data: web3.utils.sha3('totalSupply()')
                        });
                        if (call === '0x') {
                            isTokenContract = false;
                        } else {
                            try {
                                // ERC20 & ERC223 Token Standard compatible format
                                contractdb.tokenName = await Token.methods.name().call();
                                contractdb.decimals = await Token.methods.decimals().call();
                                contractdb.symbol = await Token.methods.symbol().call();
                                contractdb.totalSupply = await Token.methods.totalSupply().call();
                            } catch (err) {
                                isTokenContract = false;
                            }
                        }
                    } catch (err) {
                        isTokenContract = false;
                    }
                    contractdb.byteCode = await web3.eth.getCode(contractAddress);
                    if (isTokenContract) {
                        contractdb.ERC = 2;
                    } else {
                        // Normal Contract
                        contractdb.ERC = 0;
                    }
                    // Write to db
                    Contract.update({
                            address: contractAddress
                        }, {
                            $setOnInsert: contractdb
                        }, {
                            upsert: true
                        },
                        (err, data) => {
                            if (err) {
                                console.log(err);
                            }
                        },
                    );
                } else {
                    // Internal transaction  . write to doc of InternalTx
                    const transfer = {
                        'hash': '',
                        'blockNumber': 0,
                        'from': '',
                        'to': '',
                        'contract': '',
                        'value': 0,
                        'timestamp': 0,
                    };
                    const methodCode = txData.input.substr(0, 10);
                    if (ERC20_METHOD_DIC[methodCode] === 'transfer' || ERC20_METHOD_DIC[methodCode] === 'transferFrom') {
                        if (ERC20_METHOD_DIC[methodCode] === 'transfer') {
                            // Token transfer transaction
                            transfer.from = txData.from;
                            transfer.to = `0x${txData.input.substring(34, 74)}`;
                            transfer.value = Number(`0x${txData.input.substring(74)}`);
                        } else {
                            // transferFrom
                            transfer.from = `0x${txData.input.substring(34, 74)}`;
                            transfer.to = `0x${txData.input.substring(74, 114)}`;
                            transfer.value = Number(`0x${txData.input.substring(114)}`);
                        }
                        transfer.method = ERC20_METHOD_DIC[methodCode];
                        transfer.hash = txData.hash;
                        transfer.blockNumber = blockData.number;
                        transfer.contract = txData.to;
                        transfer.timestamp = blockData.timestamp;
                        // Write transfer transaction into db
                        TokenTransfer.update({
                                hash: transfer.hash
                            }, {
                                $setOnInsert: transfer
                            }, {
                                upsert: true
                            },
                            (err, data) => {
                                if (err) {
                                    console.log(err);
                                }
                            },
                        );
                    }
                }
            }
            self.bulkOps.push(tx);
        }
        if (!('quiet' in config && config.quiet === true)) {
            console.log(`\t- block #${blockData.number}: ${blockData.transactions.length} transactions recorded.`);
        }
    }
    self.blocks++;

    if (flush && self.blocks > 0 || self.blocks >= config.bulkSize) {
        const bulk = self.bulkOps;
        self.bulkOps = [];
        self.blocks = 0;
        const { miners } = self;
        self.miners = [];

        // setup accounts
        const data = {};
        bulk.forEach((tx) => {
            data[tx.from] = {
                address: tx.from,
                blockNumber: tx.blockNumber,
                type: 0
            };
            if (tx.to) {
                data[tx.to] = {
                    address: tx.to,
                    blockNumber: tx.blockNumber,
                    type: 0
                };
            }
        });

        // setup miners
        miners.forEach((miner) => {
            data[miner.address] = miner;
        });

        const accounts = Object.keys(data);

        if (bulk.length === 0 && accounts.length === 0) return;
        
        // update balances
        if (config.settings.useRichList && accounts.length > 0) {
            asyncL.eachSeries(accounts, (account, eachCallback) => {
                const { blockNumber } = data[account];
                // get contract account type
                web3.eth.getCode(account, async (err, code) => {
                    if (err) {
                        console.log(`ERROR: fail to getCode(${account})`);
                        return eachCallback(err);
                    }
                    if (code.length > 2) {
                        data[account].type = 1; // contract type
                    }

                    try {
                        const balance = await web3.eth.getBalance(account);
                        data[account].balance = parseFloat(web3.utils.fromWei(balance, 'ether'));
                        eachCallback();
                    } catch (err) {
                        console.log(err);
                        console.log(`ERROR: fail to getBalance(${account})`);
                        return eachCallback(err);
                    }                    
                });
            }, (err) => {
                let n = 0;
                accounts.forEach((account) => {
                    n++;
                    if (!('quiet' in config && config.quiet === true)) {
                        if (n <= 5) {
                            console.log(` - upsert ${account} / balance = ${data[account].balance}`);
                        } else if (n === 6) {
                            console.log(`   (...) total ${accounts.length} accounts updated.`);
                        }
                    }
                    // upsert account
                    Account.collection.update({
                        address: account
                    }, {
                        $set: data[account]
                    }, {
                        upsert: true
                    });
                });
            });
        }

        if (bulk.length > 0) {
            Transaction.collection.insert(bulk, (err, tx) => {
                if (typeof err !== 'undefined' && err) {
                    if (err.code === 11000) {
                        if (!('quiet' in config && config.quiet === true)) {
                            console.log(`Skip: Duplicate transaction key ${err}`);
                        }
                    } else {
                        console.log(`Error: Aborted due to error on Transaction: ${err}`);
                        process.exit(9);
                    }
                } else {
                    if (!('quiet' in config && config.quiet === true)) {
                        console.log(`* ${tx.insertedCount} transactions successfully recorded.`);
                    }
                }
            });
        }
    }
};

module.exports = {
    normalize,
    writeManyToDB
}
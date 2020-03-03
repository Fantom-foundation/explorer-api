const IO = require("socket.io");

const web3 = require('../../../mixins/web3');
const wsErrors = require('../../../mixins/websocketErrors');

const port = process.env.SOCKETIOSERVER_PORT || 4600;
const ioServer = IO.listen(port);

///////////////
// Functions //
///////////////

function addNsp(nspName){ // nsp for namespace
    if (!nspName) return;

    const nsp = ioServer.of(nspName);
    const rooms = nsp.adapter.rooms;
    console.log(`Namespace ${nsp.name}: created`);

    nsp.on('connection', (socket)=> {
        console.log(`Namespace ${socket.nsp.name}: client connected`);

        socket.on('subscribe', async () => { 
            try {
                if (rooms[`subscribedClients`] && rooms[`subscribedClients`].sockets[socket.id]){
                    const error = JSON.stringify({ ...wsErrors.alreadySubscribed });
                    socket.emit(`errorEvent`, error);
                    return;
                }
                    
                socket.join(`subscribedClients`);
                console.log(`Namespace ${socket.nsp.name}: client subscribed`);

                const payload = JSON.stringify({ event: `subscribed` });
                socket.emit(`message`, payload);
            } catch (err) {
                console.log(err);
                const error = JSON.stringify({ ...wsErrors.internalServerError });
                socket.emit(`errorEvent`, error);
            }
        });	
        
        socket.on('unsubscribe', async () => {
            try {          
                if (rooms[`subscribedClients`] && rooms[`subscribedClients`].sockets[socket.id]){
                    const error = JSON.stringify({ ...wsErrors.notSubscribed });
                    socket.emit(`errorEvent`, error);
                    return;
                }		

                socket.leave(`subscribedClients`);
                console.log(`Namespace ${socket.nsp.name}: client unsubscribed`);

                const payload = JSON.stringify({ event: `unsubscribed` });
                socket.emit(`message`, payload);
            } catch (err) {
                console.log(err);
                const error = JSON.stringify({ ...wsErrors.internalServerError });
                socket.emit(`errorEvent`, error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Namespace ${socket.nsp.name}: client disconnected`);
        });
    });;
};

function deleteNsp(nspName){ // nsp for namespace
    if (!nspName) return;

    const nsp = ioServer.of(nspName);

    const connectedSockets = Object.keys(nsp.connected);
    connectedSockets.forEach(socketId => {
        nsp.connected[socketId].disconnect();
    });
    nsp.removeAllListeners();
    delete ioServer.nsps[nspString];
}

async function listenLatestBlocks() {
    const newBlocks = web3.eth.subscribe('newBlockHeaders');

    newBlocks.on('data', async (blockHeader) => {
        const blockNumber = blockHeader.number;      
        console.log(`New block:`, blockNumber);  
        processBlock(blockNumber);
    });
    
    newBlocks.on('error', console.error);
};

async function processBlock(blockNumber) {
    try {  
        const nsp = ioServer.nsps[`/new/blocks`];
        if (!nsp || !nsp.adapter.rooms[`subscribedClients`] || !nsp.adapter.rooms[`subscribedClients`].length){
            return;
        }

        const blockData = await web3.eth.getBlock(blockNumber, true);     
        const lastTrxs = [];
        const newBlock = {
            gasUsed: blockData.gasUsed,
            hash: blockData.hash,
            number: blockData.number,
            parentHash: blockData.parentHash,
            stateRoot: blockData.stateRoot,
            timestamp: blockData.timestamp,
            transactions: blockData.transactions.length,        
        };

        for (const trx of blockData.transactions) {
            const receipt = await web3.eth.getTransactionReceipt(trx.hash);
            lastTrxs.push({
                hash: trx.hash,
                from: trx.from,
                to: trx.to,
                value: trx.value,
                transactionIndex: trx.transactionIndex,
                blocknumber: trx.blocknumber,
                timestamp: blockData.timestamp,
                fee: String(receipt.gasUsed * trx.gasPrice),
            });
        }

        sendToSubscribers(nsp, newBlock, lastTrxs);
    } catch (err) {
        console.log(err);
    }
}

function sendToSubscribers(nsp, newBlock, lastTrxs){
    const payload = JSON.stringify({ event: `newBlock`, block: newBlock, lastTrxs });
    nsp.to(`subscribedClients`).emit(`message`, payload);
    console.log(`Sent to ${nsp.adapter.rooms[`subscribedClients`].length} clients`);
}

////////////////////////////////
// Namespaces inititalization //
////////////////////////////////

const namespacesUrls = [
    `/new/blocks`
];

namespacesUrls.forEach(nspUrl => addNsp(nspUrl));

///////////////////////////////
// Listen Fantom node socket //
///////////////////////////////

listenLatestBlocks();

module.exports = ioServer;
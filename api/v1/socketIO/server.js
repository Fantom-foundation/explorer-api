const IO = require("socket.io");
const wsErrors = require("../../../mixins/websocketErrors");
const { Block, Transaction } = require('../../../db.js');

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

let prevBlock; // previous block number
async function getNewBlockAndEmit() {
    try {
        const newBlock = await Block.findOne().select('-_id').sort({ number: -1 }).limit(1);

        if (!newBlock) {
            return;
        }

        if (prevBlock == newBlock.number) {
            return;
        }

        const lastTrxs = await Transaction.find({ blockNumber: newBlock.number })
                                          .select('-_id hash from to value transactionIndex blocknumber timestamp fee')
                                          .sort(`-transactionIndex`);

        console.log(`New block: ${newBlock.number}`);

        prevBlock = newBlock.number;
        
        const nsp = ioServer.nsps[`/new/blocks`];

        if (nsp && nsp.adapter.rooms[`subscribedClients`]){
            const payload = JSON.stringify({ event: `newBlock`, block: newBlock, lastTrxs });
            nsp.to(`subscribedClients`).emit(`message`, payload);
            console.log(`Sent to ${nsp.adapter.rooms[`subscribedClients`].length} clients`);
        }
    } catch (err) {
    console.log(err);
    }
}

////////////////////////////////
// Namespaces inititalization //
////////////////////////////////

const namespacesUrls = [
    `/new/blocks`
];

namespacesUrls.forEach(nspUrl => addNsp(nspUrl));

//////////
// Jobs //
//////////

async function newBlocksEmitter() {
    await getNewBlockAndEmit();
    setTimeout(
        async () => {
            newBlocksEmitter();
        }, 
        250
    );
}

newBlocksEmitter();

module.exports = ioServer;
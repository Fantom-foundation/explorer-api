////////////////////////
// For server testing //
////////////////////////

const
    io = require("socket.io-client"),
    client = io.connect("http://localhost:3001/new/blocks");

client.on('connect', () => {
    console.log(`Connected to server`); // true
    client.emit('subscribe');
});

client.on("message", (msg) => {
    try {
        msg = JSON.parse(msg);
        console.log(msg);
    } catch (err) {
        console.log(err);
    }
});

client.on("errorEvent", (msg) => {
    try {
        msg = JSON.parse(msg);
        console.log(msg);
    } catch (err) {
        console.log(err);
    }
});
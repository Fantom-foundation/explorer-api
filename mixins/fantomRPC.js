const rp = require('request-promise');
const config = require('config');

function reqOpts({ method, params, id }){
    const uri = `http://${config.nodeAddr}:${config.apiPort}`;
    const options = {
        method: 'POST',
        uri,
        headers: {
            'content-type': 'application/json'
        },
        body: {
            jsonrpc: "2.0",
            method, 
            params, 
            id
        },
        json: true // Automatically stringifies the body to JSON
    };

    return options;
}

module.exports = (body) => rp(reqOpts(body));
const fetch = require('node-fetch');
const config = require('config');

/**
  Fetch market price from cryptocompare
**/
const getQuote = async() => {
    const URL = `https://min-api.cryptocompare.com/data/price?fsym=${config.settings.symbol}&tsyms=USD`;

    try {
        const requestUSD = await fetch(URL);
        const quoteUSD = await requestUSD.json();

        quoteObject = {
            timestamp: Math.round(Date.now() / 1000),
            quoteUSD: quoteUSD.USD,
        };

        new Market(quoteObject).save((err, market, count) => {
            if (typeof err !== 'undefined' && err) {
                process.exit(9);
            } else {
                if (!('quiet' in config && config.quiet === true)) {
                    console.log('DB successfully written for market quote.');
                }
            }
        });
    } catch (error) {
        if (!('quiet' in config && config.quiet === true)) {
            console.log(error);
        }
    }
};

module.exports = {
    getQuote
}
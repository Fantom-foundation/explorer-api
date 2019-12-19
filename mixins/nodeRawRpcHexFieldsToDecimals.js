const utils = require('web3-utils');

/**
 * @param {object} fields object with fields from fantom node raw rpc answer's 'result' object
 */
module.exports = (fields) => {
    for (let [key, value] of Object.entries(fields)) {
        if (key === `address`) continue;
        
        if (typeof value === `string` && value.startsWith(`0x`)){
            fields[key] = utils.hexToNumberString(value);
        }
    }
    return fields;
}
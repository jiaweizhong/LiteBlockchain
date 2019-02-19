const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');
    // input string combined
    hash.update(inputs.sort().join(''));
    return hash.digest('hex');
};


module.exports = cryptoHash;
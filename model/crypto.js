var crypto = require('crypto');

function endcode(str) {
    var hash = crypto.createHash('sha256');
    return hash.update(str).digest('hex');
}

exports.encode = endcode;
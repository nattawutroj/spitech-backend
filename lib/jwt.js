const jwt = require('jsonwebtoken')
const secretKey = 'ITProject'

function gentoken(payload) {
    console.log(payload)
    return jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60*60*60*60*60),
        data: payload
      },  secretKey);
}

function verify(token, callback) {
    try {
        var decoded = jwt.verify(token.slice(7), secretKey)
        callback({status: 200, data: decoded.data})
    } catch(err) {
        callback({status: 401, message: err.message})
    }
}
  module.exports = {
    gen: gentoken,
    verify: verify
  }
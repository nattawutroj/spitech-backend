const jwt = require('jsonwebtoken')
const secretKey = 'ITProject'

function gentoken(payload) {
    return jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60*60*60),
        data: payload
      },  secretKey);
}

function verify(token, proof) {
    try {
        var decoded = jwt.verify(token.slice(7), secretKey)
        console.log(decoded)
        proof(decoded)
    } catch(err) {
        proof(2)
    }
}
  module.exports = {
    gen: gentoken,
    verify: verify
  }
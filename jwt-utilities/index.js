const jwt = require('jsonwebtoken')


function signToken(payload, secret) {
    return jwt.sign(payload, secret)
}

function verifyToken(token, secret) {
    return jwt.verify(token, secret)
}



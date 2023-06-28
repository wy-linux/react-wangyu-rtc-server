function calcAcceptKey(key) {
    // const key = 'h/nwoA7QgNoubhcILOg3BQ=='
    // const accept = 'brwx0cA1OlF/v+kUs0B8zH7BhlI='
    const CODE = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
    const crypto = require('crypto')    
    const acceptKey = crypto.createHash('sha1').update(key + CODE).digest('base64')
    // console.log(acceptKey === accept)
    return acceptKey
}
module.exports = calcAcceptKey

/**
Websocket Request Header

GET ws://localhost:8888/ HTTP/1.1
Host: localhost:8888
Connection: Upgrade
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36
Upgrade: websocket
Origin: http://localhost:3000
Sec-WebSocket-Version: 13
Accept-Encoding: gzip, deflate, br
Accept-Language: zh,zh-CN;q=0.9
Sec-WebSocket-Key: h/nwoA7QgNoubhcILOg3BQ==
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
*/

/**
Websocket Response Header

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: brwx0cA1OlF/v+kUs0B8zH7BhlI=
*/
const net = require('net')
const calcAcceptKey = require('./key')
const server = net.createServer(function (socket) {
    //Event Emitter 只会执行一次
    socket.once('data', function(data) {
        data = data.toString()
        if(data.match(/Connection: Upgrade/)) {
            let rows = data.split('\r\n')
            rows = rows.slice(1, -2)
            const headers = {}
            rows.reduce((memo, item) => {
                let [key, value] = item.split(': ')
                memo[key] = value
                return memo
            }, headers)
            if(headers['Sec-WebSocket-Version'] === '13') {
                let secWebSocketKey = headers['Sec-WebSocket-Key']
                const secWebSocketAccept = calcAcceptKey(secWebSocketKey)
                const response = [
                    'HTTP/1.1 101 Switching Protocols',
                    'Upgrade: websocket',
                    'Connection: Upgrade',
                    `Sec-WebSocket-Accept: ${secWebSocketAccept}`,
                    '\r\n'
                ].join('\r\n')
                socket.write(response)
                //后面所有连接都是 WebSocket 协议
                socket.on('data', function(buffers) {
                    const fn = buffers[0] & 0b10000000 === 0b10000000 //结束位
                    const opcode = buffers[0] & 0b00001111 //操作码
                    const isMask = buffers[1] & 0b10000000 === 0b10000000 //是否掩码
                    let payloadLength = buffers[1] & 0b01111111 //负载长度
                    let payload = Buffer.alloc(payloadLength)
                    if(payloadLength <= 125) {
                        if(isMask) {
                            const mask = buffers.slice(2, 6) //掩码键
                            payload = buffers.slice(6) //携带数据
                            unmask(payload, mask) //对数据反掩码操作
                        } else {
                            payload = buffers.slice(2) //携带数据
                        }
                    } else if(payloadLength === 126){
                        payloadLength = buffers.slice(2, 4)
                        //......
                    }
                    const response = Buffer.alloc(2 + payloadLength)
                    response[0] = 0b10000000 | opcode
                    response[1] = payloadLength
                    payload.copy(response, 2)
                    socket.write(response)
                })
            }
        }
    })
})

function unmask(payload, mask) {
    for(let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % 4]
    }
}

server.listen(9999, () => {
    console.log('listening 9999 ...')
})
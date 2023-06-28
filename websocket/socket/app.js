const express = require('express')
const app = express()
app.use(express.static(__dirname))
app.listen(3000, () => {
    console.log('listening 3000 ...')
})

// const WebSocketServer = require('ws').Server
// const server = new WebSocketServer({port: 8888})
// server.on('connection', function(socket) {
//     console.log('连接成功！');
//     socket.on('message', function(message) {
//         console.log('客户端消息:' + message);
//         socket.send('服务端发送:' + message)
//     })
// })
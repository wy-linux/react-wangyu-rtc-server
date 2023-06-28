const express = require('express')
const {Message} = require('./db')
const app = express()
app.use(express.static(__dirname))
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const SYSTEM = '系统'
const sockets = {}
io.on('connection', (socket) => {
    let username
    const rooms = []
    socket.on('getAllMessages', async() => {
        const messages = await Message.find().sort({createAt: -1}).limit(10)
        messages.reverse()
        socket.emit('allMessages', messages)
    })
    socket.on('join', (roomName) => {
        let index = rooms.indexOf(roomName)
        if(index === -1) {
            rooms.push(roomName)
            socket.join(roomName)
            socket.emit('joined', roomName)
        }
    })
    socket.on('leave', (roomName) => {
        let index = rooms.indexOf(roomName)
        if(index !== -1) {
            rooms.splice(index, 1)
            socket.leave(roomName)
            socket.emit('leaved', roomName)
        }
    })
    socket.on('message', async (message) => {
        if(username) {
            let result = message.match(/@([^ ]+) (.+)/)
            if(result) {//私聊
                const toUser = result[1]
                const toContent = result[2]
                const toSocket = sockets[toUser]
                toSocket?.emit('message', getMsg(toContent, username))
            } else {//公聊
                const savedMessage = await Message.create(getMsg(message, username))
                if(rooms.length > 0) {
                    rooms.forEach(room => {
                        io.in(room).emit('message', savedMessage)
                    })
                } else {
                    //大厅内说话，所有人都能听到（包括其他房间 + 其他大厅的人）
                    io.emit('message', savedMessage)
                }
            }
        } else {
            const oldSocket = sockets[message]
            if(oldSocket) {
                socket.emit('message', getMsg(`${message}已经被占用！`))
            } else {
                username = message
                //用户名与socket关联
                sockets[username] = socket
                socket.broadcast.emit('message', getMsg(`${username}加入聊天室`))
            }
        }
    })
})
function getMsg(content, username = SYSTEM) {
    return {
        username,
        content,
        createAt: new Date
    }
}
server.listen(3000, () => {
    console.log('listening 3000 ...')
})

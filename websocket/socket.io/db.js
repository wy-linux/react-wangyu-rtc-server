const mongoose = require('mongoose')
const conn = mongoose.createConnection('mongodb://root:root@localhost/chat')
const MessageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createAt:{
        type: Date,
        default: Date.now
    }
})
const Message = conn.model('Message', MessageSchema)
module.exports = {
    Message
}
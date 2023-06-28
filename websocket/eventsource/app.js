const express = require('express')
const app = express()
app.use(express.static(__dirname))
const SseStream = require('ssestream')
let counter = 0
app.get('/clock', (req, res) => {
    const sseStream = new SseStream(req)
    sseStream.pipe(res)
    const pusher = setInterval(() => {
        sseStream.write({
            id: counter++,
            event: 'message',
            retry: 2000,
            data: new Date().toString()
        })
    }, 1000)
    res.on('close', () => {
        clearInterval(pusher)
        sseStream.unpipe(res)
    })
})
app.listen(3000, () => {
    console.log('listening 3000 ...')
})
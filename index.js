const express = require('express')
const smallPacket = require('./src/smallPacket')
const bigPacket = require('./src/bigPacket')
const dotenv = require('dotenv')
const cors = require('cors')

const uploadFlood = require('./src/uploadFlood')
const gcBig = require('./src/gcAuthBig')



const PORT = process.env.PORT || 3000
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
dotenv.config()

const app = express()

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors({
    origin: '*'
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/index.html')
})

// Small
app.post('/api/small', (req, res) => {
    const { serverAddr, randString, lowAmount, highAmount } = req.body
    smallPacket.sendSmallPacket(randString, serverAddr, lowAmount, highAmount, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            r: randString,
            l: lowAmount,
            h: highAmount
        }
    })
})


// Single small
app.post('/api/singlesmall', (req, res) => {
    const { serverAddr } = req.body
    var _ = smallPacket.singleSmall(serverAddr, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
        }
    })
})


// Big
app.post('/api/big', (req, res) => {
    const { serverAddr, randString, multiplier, amount } = req.body
    bigPacket.sendBigPacket(serverAddr, randString, multiplier, amount, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            r: randString,
            m: multiplier
        }
    })
})


// SIngle big
app.post('/api/singleBig', (req, res) => {
    const { serverAddr, multiplier } = req.body
    bigPacket.singleBig(serverAddr, multiplier, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            m: multiplier
        }
    })
})

// gc Big
app.post('/api/gcauthbig', (req, res) => {
    const { serverAddr, randString, multiplier, amount } = req.body
    gcBig.sendBigPacket(serverAddr, randString, multiplier, amount, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            r: randString,
            m: multiplier
        }
    })
})


// SIngle gcauth big
app.post('/api/gcauthsinglebig', (req, res) => {
    const { serverAddr, multiplier } = req.body
    gcBig.singleBig(serverAddr, multiplier, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            m: multiplier
        }
    })
})

// single upload
app.post('/api/singleupload', (req, res) => {
    const { serverAddr, multiplier } = req.body
    uploadFlood.singleUpload(serverAddr, multiplier, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            m: multiplier
        }
    })
})

//multi upload
app.post('/api/upload', (req, res) => {
    const { serverAddr, randString, multiplier, amount } = req.body
    uploadFlood.sendUpload(serverAddr, randString, multiplier, amount, io)

    return res.json({
        status: 'accepted',
        data: {
            s: serverAddr,
            r: randString,
            m: multiplier
        }
    })
})

io.on('connection', (socket) => {
    console.log('a user connected');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
    //   console.log('message: ' + msg);
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
    //   io.emit('chat message', msg);
    });
});

server.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})

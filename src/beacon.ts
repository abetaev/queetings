// HTTPS

import https from 'https'
import http, { IncomingMessage, ServerResponse } from 'http'
import { Server as FileServer } from 'node-static'
import fs from 'fs'

const fileServer = new FileServer("./peer")

const dev = process.env['DEV'] && true

const handler = (req: IncomingMessage, res: ServerResponse) => {
  dev && res.setHeader('Cache-Control', 'no-cache')
  fileServer.serve(req, res)
}

const ssl = (dev || process.env['SSL']) && true

const rootServer = (
  ssl ?
    https.createServer(
      {
        cert: fs.readFileSync("server.cert"),
        key: fs.readFileSync("server.key")
      },
      handler) :
    http.createServer(handler))

rootServer.listen(process.env.PORT || (ssl ? 8082 : 8080))

// WebSocket

import WebSocket, { Server } from 'ws'
import { v4 as uuid } from 'uuid'

const { stringify } = JSON

const wsServer = new Server({ server: rootServer });

const hosts: { [invitation: string]: WebSocket } = {}

wsServer.on('connection', (socket, request) => {
  let [, invitation] = request.url.split('/')
  if (!invitation) {
    invitation = uuid()
    hosts[invitation] = socket
    const url = `wss://${request.headers['host']}/${invitation}`
    socket.send(JSON.stringify({ type: 'invite', url }))
    log(`create ${invitation}`)
  } else if (hosts[invitation]) {
    meet(hosts[invitation], socket)
    delete hosts[invitation]
    log(`accept ${invitation}`)
  } else {
    log(`invitation ${invitation} does not exist`)
    socket.send(stringify({ type: "error", code: "void" }))
    socket.close()
  }
})

wsServer.on('error', error => {
  log(error)
})


function meet(host: WebSocket, guest: WebSocket) {

  [[host, guest], [guest, host]].forEach(
    ([from, to]) => from.on('message', data => {
      log(`${from === host ? 'host' : 'guest'}: ${stringify(data)}`)
      to.send(data)
    })
  );

}

const logging = (dev || process.env.LOGGING) && true

function log(...args: any) {
  if (logging) {
    console.log(args)
  }
}

// STUN

// const stunSocket = require('dgram').createSocket({type: 'udp4', reuseAddr: true})

// var server = new (require('stun').StunServer)(stunSocket);

// // Set log event handler
// server.on('log', function (log) {
//   console.log('STUN: %s : [%s] %s', new Date(), log.level, log.message);
// });

// server.listen(3478, '0.0.0.0')

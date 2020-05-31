// config

const dev = process.env['DEV'] && true

const logging = (dev || process.env.LOGGING) && true
function log(...args: any) {
  if (logging) {
    console.log(args)
  }
}

const ssl = (dev || process.env['SSL']) && true

// HTTPS

import https from 'https'
import http, { IncomingMessage, ServerResponse } from 'http'
import { Server as FileServer } from 'node-static'
import fs from 'fs'

const fileServer = new FileServer("./peer")

const handler = (req: IncomingMessage, res: ServerResponse) => {
  dev && res.setHeader('Cache-Control', 'no-cache')
  if (!req.url.includes('.')) {
    req.url = `https://${req.headers.host}/`
  }
  fileServer.serve(req, res)
}

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

rootServer.on('close', () => {
  log(`exiting...`)
})

// WebSocket

import WebSocket, { Server } from 'ws'
import { v4 as uuid } from 'uuid'

const wsServer = new Server({ server: rootServer });

const links: { [invitation: string]: WebSocket } = {}

function add(id: string, socket: WebSocket) {
  log(`add ${id}`)
  links[id] = socket
  socket.onmessage = ({ data }) => {
    const input: InputMessage = JSON.parse(data.toString())
    if (input.type === 'data' && links[input.to]) {
      const output: OutputDataMessage = { type: 'data', guest: id, data: input.data }
      links[input.to].send(JSON.stringify(output))
    }
  }
  socket.onclose = () => {
    delete links[id]
    log(`delete ${id}`)
  }
  socket.send(JSON.stringify({ type: 'host', host: id }))
}

const { stringify } = JSON

wsServer.on('connection', (socket, request) => {
  let host = request.url.substring(1)

  if (!host) {
    host = uuid()
  }

  if (!links[host]) {
    console.log(`host connection`)
    add(host, socket)
  } else {
    const guest = uuid()
    add(guest, socket)
    links[host].send(stringify({ type: 'guest', guest }))
    log(`${guest}@${host}`)
  }

})

wsServer.on('error', error => {
  log(error)
})

log(`beacon started: dev=${dev}, ssl=${ssl}`)

// STUN

// const stunSocket = require('dgram').createSocket({type: 'udp4', reuseAddr: true})

// var server = new (require('stun').StunServer)(stunSocket);

// // Set log event handler
// server.on('log', function (log) {
//   console.log('STUN: %s : [%s] %s', new Date(), log.level, log.message);
// });

// server.listen(3478, '0.0.0.0')

// types

interface HostMessage {
  type: 'host'
  host: string
}
interface GuestMessage {
  type: 'guest'
  guest: string
}
interface InputDataMessage {
  type: 'data'
  to: string
  data: string
}
interface OutputDataMessage {
  type: 'data'
  guest: string
  data: string
}
export type InputMessage = InputDataMessage
export type OutputMessage = HostMessage | GuestMessage | OutputDataMessage

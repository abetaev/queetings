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

const links: { [id: string]: WebSocket } = {}

wsServer.on('connection', (socket) => {

  const id = uuid()

  log(`add ${id}`)
  links[id] = socket

  socket.onmessage = ({ data }) => {
    console.log(data)
    const input: OutputDataMessage = JSON.parse(data.toString())
    if (input.type === 'data' && links[input.to]) {
      const output: InputDataMessage = { type: 'data', from: id, data: input.data }
      links[input.to].send(JSON.stringify(output))
    }
  }

  socket.onclose = () => {
    delete links[id]
    log(`delete ${id}`)
  }

  socket.send(JSON.stringify({ type: 'id', id }))

})

wsServer.on('error', error => {
  log(error)
})

log(`relay started: dev=${dev}, ssl=${ssl}`)

export interface IdMessage {
  type: 'id'
  id: string
}
export interface OutputDataMessage {
  type: 'data'
  to: string
  data: string
}
export interface InputDataMessage {
  type: 'data'
  from: string
  data: string
}

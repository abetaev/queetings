import { Connection, Network } from "../model"
import { v4 as uuid } from 'uuid'

const KEEP_ALIVE_TIMEOUT = 1000;
const MONITOR_TIMEOUT = 10000;

export type ConversationEvent = { type: 'open' | 'close' }
  | { type: 'data', data: string }
  | { type: 'forward', message: ControlMessage }
  | { type: 'extend', peers: string[] }
  | { type: 'join', to: string, invitation: URL }

export type ConversationEventHandler = (conversation: Conversation, event: ConversationEvent) => void

export const anonymousId = uuid()

type EchoMessage = { type: "echo" | "hello", id: string, peers: string[] }
type JoinMessage = { type: "join", invitation: string }
type DataMessage = { type: "data", data: string }
export type ControlMessage = { to?: string, from?: string } & (
  EchoMessage
  | JoinMessage
  | DataMessage
)


export class Conversation implements Connection {
  public id: string = anonymousId
  public stream: MediaStream = null
  private control: RTCDataChannel
  private echoes: number = 0
  private alive: boolean = true
  constructor(
    private readonly network: Network,
    private readonly peer: RTCPeerConnection,
    private readonly eventHandler: ConversationEventHandler
  ) {
    peer.ontrack = ({ streams: [stream] }) => {
      console.log('stream!')
      this.stream = stream
    }
  }

  start(control: RTCDataChannel) {
    this.control = control
    control.onmessage = event => this.onMessage(JSON.parse(event.data))
    this.send({
      type: 'hello',
      id: this.network.id,
      peers: Object.keys(this.network.connections)
    })
  }

  private async onMessage(message: ControlMessage) {
    const { to } = message

    if (to) {
      this.eventHandler(this, { type: 'forward', message })
      return;
    }

    if (message.type === "hello") {
      this.init(message.id)
      this.eventHandler(this, { type: 'extend', peers: message.peers })
      return
    } else if (message.type === "join") {
      this.eventHandler(this, { type: 'join', to: message.from, invitation: new URL(message.invitation) })
      return
    } else if (message.type === "echo") {
      this.echoes++;
      this.eventHandler(this, { type: 'extend', peers: message.peers });
      return
    } else if (message.type === "data") {
      this.eventHandler(this, message)
      return
    }

    console.log(`unexpected message: ${JSON.stringify(message)}`)
    this.close()

  }

  private init(id: string) {
    console.log(`init: ${id}`)
    if (this.id !== anonymousId) {
      console.log(`illegal operation, closing connection with ${this.id}/${id}`)
      this.close()
      return
    }
    if (!id) {
      console.log(`illegal operation, closing connection`)
      this.close()
      return
    }
    this.id = id
    this.keepAlive()
    this.monitor()
    this.eventHandler(this, { type: 'open' })
  }

  private keepAlive() {
    this.send({
      type: 'echo',
      id: this.network.id,
      peers: Object.keys(this.network.connections)
    })
    if (this.alive) {
      setTimeout(() => this.keepAlive(), KEEP_ALIVE_TIMEOUT)
    }
  }

  private monitor() {
    setTimeout(
      () => {
        if (this.echoes === 0) {
          this.close()
        } else {
          this.echoes = 0
        }
        if (this.alive) {
          this.monitor()
        }
      },
      MONITOR_TIMEOUT
    )
  }

  close() {
    this.alive = false
    this.peer.close()
    if (this.id) {
      this.eventHandler(this, { type: 'close' })
    }
  }

  send(message: ControlMessage | string) {
    if (typeof message === "string") {
      this.control.send(JSON.stringify({ type: 'data', data: message }))
    } else {
      this.control.send(JSON.stringify(message))
    }
  }

}

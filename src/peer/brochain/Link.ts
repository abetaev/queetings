/**
 * transmit data and
 */

interface ICECandidateMessage {
  type: 'ice'
  candidate: RTCIceCandidateInit
}
interface OfferMessage {
  type: 'offer'
  from: string
  sdp: string
}
interface AnswerMessage {
  type: 'answer'
  from: string
  sdp: string
}
interface ErrorMessage {
  type: 'error'
  from?: string
  code?: string
}
interface DataMessage<T> {
  type: 'data'
  data: T
}
interface InviteMessage {
  type: 'invite'
  url: string
}
export type Message<T> =
  ICECandidateMessage
  | OfferMessage
  | AnswerMessage
  | ErrorMessage
  | DataMessage<T>
  | InviteMessage

type MessageSender = (message: string) => Promise<void>
type MessageReceiver = (message: string) => void

export interface Connection {
  send: MessageSender
  receive(receiver: MessageReceiver): void
  close(): void
}

interface JoinEvent {
  type: 'join'
}
interface TearEvent {
  type: 'tear'
}
interface UpdateEvent {
  type: 'update'
}
interface StreamEvent {
  type: 'stream'
  stream: MediaStream
}
interface InviteEvent {
  type: 'invite'
  url: URL
}
interface CallEvent {
  type: 'call'
  from: string
  take: () => Promise<void>
}
export type Event =
  JoinEvent
  | TearEvent
  | UpdateEvent
  | StreamEvent
  | InviteEvent
  | CallEvent

export type EventHandler = (event: Event) => void
export type DataHandler<T> = (source: string, data: T) => void

export default class Link<T> {

  private readonly peer: RTCPeerConnection

  private controlChannel?: RTCDataChannel

  public id: string

  private state: 'offering' | 'normal'

  constructor(
    private readonly chainId: string,
    private readonly handler: EventHandler,
    private readonly dataHandler: DataHandler<T>,
    private readonly mode: 'offer' | 'answer',
    private connection: Connection,
    stunURLs: URL[]
  ) {
    const configuration: RTCConfiguration = {
      iceServers: stunURLs.map(url => ({ urls: url.toString() }))
    }
    const peer = new RTCPeerConnection(configuration)
    connection.receive(message => this.process(message))
    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      const { candidate } = event
      if (candidate) {
        this.transmit({
          type: 'ice',
          candidate
        });
      }
    };
    peer.ondatachannel = ({ channel }) => {
      if (channel.label === 'control') {
        if (this.mode === 'offer') {
          console.log(`error: answering side sent control channel`)
          this.tear()
        }
        const completeJoin = this.id && !this.controlChannel
        this.controlChannel = channel
        if (completeJoin) {
          this.complete()
        }
      }
    }
    peer.onnegotiationneeded = () => this.offer()
    peer.ontrack = ({ streams: [stream] }) => {
      console.log(`track!`)
      handler({ type: 'stream', stream })
    }

    this.peer = peer;

    if (mode === 'offer') {
      this.offer();
    }

  }

  private async offer() {
    if (this.state === 'offering') {
      return;
    }
    try {
      this.state = 'offering'
      if (!this.controlChannel) {
        const controlChannel = this.peer.createDataChannel('control')
        controlChannel.onopen = () => {
          console.log(`control channel opened`)
          const completeJoin = this.id && !this.controlChannel
          this.controlChannel = controlChannel
          if (completeJoin) {
            this.complete()
          }
        }
      }
      const offer = await this.peer.createOffer()
      await this.transmit({ from: this.chainId, type: 'offer', sdp: offer.sdp })
      await this.peer.setLocalDescription(offer)
    } finally {
      this.state = 'normal'
    }
  }

  private async process(data: string) {
    const message: Message<T> = JSON.parse(data)
    console.log(`received ${message.type}`)
    switch (message.type) {

      case 'offer':
        if (this.mode === 'offer' && this.state === 'offering') {
          console.log(`ignoring offer from ${this.id}`)
          return;
        }
        this.handler({
          type: 'call', from: message.from, take: async () => {
            console.log(`call from ${message.from} accepted`)
            await this.peer.setRemoteDescription(new RTCSessionDescription(message));
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            await this.transmit({ type: 'answer', from: this.chainId, sdp: answer.sdp });
            const completeJoin = this.controlChannel && !this.id
            this.id = message.from
            if (completeJoin) {
              this.complete()
            }
          }
        })
        break;

      case 'answer':
        const completeJoin = this.controlChannel && !this.id
        this.id = message.from
        await this.peer.setRemoteDescription(new RTCSessionDescription(message));
        if (completeJoin) {
          this.complete()
        }
        break;

      case 'ice':
        this.peer.addIceCandidate(new RTCIceCandidate(message.candidate));
        break;

      case 'error':
        console.log(`link ${this.id} error: ${message.code}`)
        this.tear()
        break;

      case 'data':
        this.dataHandler(this.id, message.data)
        break;

      case 'invite':
        this.handler({
          type: 'invite',
          url: new URL(message.url)
        })
        break;

    }
  }

  private complete() {
    console.log(`completing negotiation with ${this.id}`)
    this.connection.close()
    this.connection = {
      send: async (message) => this.controlChannel.send(message),
      close: () => this.controlChannel.close(),
      receive: (receiver: MessageReceiver) => this.controlChannel.onmessage = ({ data }) => receiver(data)
    }
    this.controlChannel.onmessage = ({ data }) => this.process(data)
    this.handler({ type: 'join' })
  }

  private async transmit(message: Message<T>): Promise<void> {
    console.log(`transmitting ${message.type}`)
    await this.connection.send(JSON.stringify(message))
  }

  public tear() {
    console.log(`tearing link ${this.id}`)
    this.connection.close()
    this.peer.close()
    this.handler({ type: 'tear' })
  }

  public send(message: T) {
    this.transmit({
      type: 'data',
      data: message
    })
  }

  public play(stream: MediaStream) {
    stream.getTracks()
      .forEach(track => this.peer.addTrack(track, stream))
  }

}
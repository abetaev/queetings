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

export interface RTCSignallingConnection {
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

  private setControlChannel(channel: RTCDataChannel) {
    channel.onmessage = ({ data }) => this.process(data)
    this.controlChannel = channel
  }

  constructor(
    private readonly chainId: string,
    private readonly handler: EventHandler,
    private readonly dataHandler: DataHandler<T>,
    private readonly mode: 'offer' | 'answer',
    private signallingConnection: RTCSignallingConnection,
    stunURLs: URL[]
  ) {
    const configuration: RTCConfiguration = {
      iceServers: stunURLs.map(url => ({ urls: url.toString() }))
    }
    const peer = new RTCPeerConnection(configuration)
    signallingConnection.receive(message => this.process(message))
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
        const emitJoinEvent = this.id && !this.controlChannel
        this.setControlChannel(channel)
        emitJoinEvent && this.handler({ type: 'join' })
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
          const emitJoinEvent = this.id && !this.controlChannel
          this.setControlChannel(controlChannel)
          emitJoinEvent && this.handler({ type: 'join' })
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
    switch (message.type) {

      case 'offer':
        if (this.mode === 'offer' && this.state === 'offering') {
          console.log(`ignoring offer from ${this.id}`)
          return;
        }
        this.handler({
          type: 'call', from: message.from, take: async () => {
            await this.peer.setRemoteDescription(new RTCSessionDescription(message));
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            await this.transmit({ type: 'answer', from: this.chainId, sdp: answer.sdp });
            const completeJoin = this.controlChannel && !this.id
            if (completeJoin) {
              this.complete(message.from)
            }
          }
        })
        break;

      case 'answer':
        const joinComplete = this.controlChannel && !this.id
        await this.peer.setRemoteDescription(new RTCSessionDescription(message));
        if (joinComplete) {
          this.complete(message.from)
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

  private complete(id: string) {
    this.id = id
    this.signallingConnection.close()
    this.signallingConnection = {
      send: async (message) => this.controlChannel.send(message),
      close: () => this.controlChannel.close(),
      receive: (receiver: MessageReceiver) => this.controlChannel.onmessage = ({ data }) => receiver(data)
    }
    this.handler({ type: 'join' })
  }

  private async transmit(message: Message<T>): Promise<void> {
    await this.signallingConnection.send(JSON.stringify(message))
  }

  public tear() {
    console.log(`tearing link ${this.id}`)
    this.handler({ type: 'tear' })
    this.peer.close()
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
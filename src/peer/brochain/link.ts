import { Connector, Event, Link, Receiver, Connection, Command } from './types'


// configuration
const documentURL = new URL(document.URL)
const stunURLs = ['stun:stun.l.google.com:19302', `stun:${documentURL.hostname}:3478`]
const configuration: RTCConfiguration = {
  iceServers: [{ urls: stunURLs }]
}

const { stringify, parse } = JSON

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
type SignallingMessage = ICECandidateMessage | OfferMessage | AnswerMessage
type SignallingConnector = Connector<SignallingMessage>

function channelToConnector<I = any, O = I>(channel: RTCDataChannel): Connector<I, O> {
  const listeners: Receiver<I>[] = []
  channel.onmessage = ({ data }) => {
    const message = parse(data)
    listeners.forEach(listener => listener(message))
  }
  return (receiver: Receiver<I>) => {
    receiver && listeners.push(receiver)
    return {
      send: (message: O) => channel.send(stringify(message)),
      close: () => channel.close()
    }
  }
}

export default function (
  identity: string,
  mode: 'offer' | 'answer',
  connector: SignallingConnector
): Link {
  let id: string | null = null
  let controlChannel: RTCDataChannel | null = null

  const peer = new RTCPeerConnection(configuration)

  const listeners: Receiver<Event>[] = []
  function emit(event: Event) {
    listeners.forEach(listener => listener(event))
  }

  peer.ontrack = ({ streams: [stream] }) => emit({ type: 'media', from: id, stream })

  let state: 'normal' | 'offering' = 'normal'

  function close() {
    peer.close()
    emit({ type: 'drop', from: id })
  }

  peer.onconnectionstatechange = ({}) => {}

  function handover(channel: RTCDataChannel) {
    controlChannel = channel
    controlChannel.onmessage = ({ data }) => receive(parse(data))
    connection.close()
    connection = {
      send(message) { controlChannel.send(stringify(message)) },
      close
    }
    emit({ type: 'join', from: id })
  }

  function receive(message: SignallingMessage) {
    let done = false

    switch (message.type) {

      case 'offer':

        if (mode === 'offer' && state === 'offering') {
          return; // ignore simultaneous offer to avoid infinite loop
        }
        id = message.from
        listeners.forEach(listener => !done && listener({
          type: 'offer',
          from: id,
          async accept() {
            if (done) return
            await peer.setRemoteDescription(new RTCSessionDescription(message))
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)
            connection.send({ type: 'answer', from: identity, sdp: answer.sdp })
            done = true
          },
          reject() { done = true }
        }))
        break;

      case 'answer':
        id = message.from
        listeners.forEach(listener => {
          !done && listener({
            type: 'answer',
            from: id,
            async confirm() {
              await peer.setRemoteDescription(new RTCSessionDescription(message))
              done = true
            },
            decline() {
              peer.close()
              done = true
            }
          })
        })
        break;

      case 'ice':
        peer.addIceCandidate(new RTCIceCandidate(message.candidate))
        break;

    }
  }

  let connection = connector((message) => receive(message))

  peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    const { candidate } = event
    if (candidate) {
      connection.send({
        type: 'ice',
        candidate
      });
    }
  };

  peer.ondatachannel = ({ channel }) => {
    if (channel.label === 'control') {
      if (mode === 'offer') {
        console.log(`error: answering side sent control channel`)
        close()
      }
      handover(channel)
    } else {
      console.log(`received channel ${channel.label}`)
      emit({
        type: 'data',
        name: channel.label,
        accept<I = any, O = I>(acceptor: Receiver<Connector<I, O>>) {
          acceptor(channelToConnector<I, O>(channel))
        }
      })
    }
  }

  async function offer() {
    if (state === 'offering') return
    try {
      state = 'offering'
      if (!controlChannel && mode === 'offer') {
        controlChannel = peer.createDataChannel('control')
        controlChannel.onopen = () => handover(controlChannel)
      }
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      connection.send({ from: identity, type: 'offer', sdp: offer.sdp })
    } finally {
      state = 'normal'
    }
  }

  peer.onnegotiationneeded = () => offer()
  mode === 'offer' && offer()

  return (receiver?: Receiver<Event>): Connection<Command> => {
    receiver && listeners.push(receiver)
    return {
      send(message: Command) {
        switch (message.type) {
          case "media":
            message.stream.getTracks()
              .forEach(track => peer.addTrack(track, message.stream))
            break;
          case "data":
            if (mode === "offer") {
              console.log(`creating channel ${message.name}`)
              const channel = peer.createDataChannel(message.name)
              channel.onopen = () => {
                console.log(`channel ${message.name} opened`)
                emit({
                  type: 'data',
                  name: message.name,
                  accept<I = any, O = I>(acceptor: Receiver<Connector<I, O>>) {
                    acceptor(channelToConnector<I, O>(channel))
                  }
                })
              }
            } else {
              console.log(`expecting channel ${message.name} to be provided`)
            }
            break;
        }
      },
      close() { peer.close() }
    }
  }

}

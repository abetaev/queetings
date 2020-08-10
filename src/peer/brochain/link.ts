import rf from 'purefi'
import { Stream } from "purefi/dist/types"
import { DataStream, Peer } from './types'

interface ICECandidateMessage {
  type: 'ice'
  candidate: RTCIceCandidateInit
}
interface OfferMessage {
  type: 'offer'
  sdp: string
}
interface AnswerMessage {
  type: 'answer'
  sdp: string
}
type SignallingMessage = ICECandidateMessage | OfferMessage | AnswerMessage
type SignallingStream = Stream<SignallingMessage>

// configuration
const documentURL = new URL(document.URL)
const stunURLs = ['stun:stun.l.google.com:19302', `stun:${documentURL.hostname}:3478`]
const configuration: RTCConfiguration = {
  iceServers: [{ urls: stunURLs }]
}

const { parse } = JSON

export default function <T>(
  mode: 'offer' | 'answer',
  initialSignallingStream: SignallingStream
): Peer<T> {

  const peer = new RTCPeerConnection(configuration)
  let signallingStream = initialSignallingStream
  let state: 'init' | 'normal' | 'offering' = 'init'

  peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    const { candidate } = event
    if (candidate) {
      publish({
        type: 'ice',
        candidate
      });
    }
  };

  function handover(channel: RTCDataChannel) {
    console.log(`handing over`)
    signallingStream = rf.run<SignallingMessage>(publish => {
      channel.onmessage = ({ data }) => publish(parse(data))
    })
    publish = signallingStream.subscribe(receive)
    state = 'normal'
  }

  async function receive(message: SignallingMessage, { publish }: SignallingStream) {
    switch (message.type) {

      case 'offer':
        if (mode === 'offer' && state === 'offering') {
          return; // ignore simultaneous offer to avoid infinite loop
        }
        // TODO: authorization
        await peer.setRemoteDescription(new RTCSessionDescription(message))
        await peer.createAnswer()
          .then(answer => {
            peer.setLocalDescription(answer)
            publish({ type: 'answer', sdp: answer.sdp })
          })
        break;

      case 'answer':
        // TODO: authorization
        peer.setRemoteDescription(new RTCSessionDescription(message))
        break;

      case 'ice':
        peer.addIceCandidate(new RTCIceCandidate(message.candidate))
        break;

    }
  }

  signallingStream.subscribe(event => `ss: ${JSON.stringify(event)}`)
  let publish = signallingStream.subscribe(receive)

  async function offer() {
    if (state !== 'offering') try {
      const previousState = state
      state = 'offering'
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      await publish({
        type: 'offer',
        sdp: offer.sdp
      })
    } finally {
      state = 'normal'
    }
  }

  peer.onnegotiationneeded = () => offer()

  if (mode === 'offer') {
    console.log(`initializing control channel`)
    const controlChannel = peer.createDataChannel('control')
    controlChannel.onopen = () => handover(controlChannel)
    offer()
  }

  return {

    media: rf.run<MediaStream>(
      publish =>
        peer.ontrack = ({ streams: [stream] }) => publish(stream)
    ),

    data: rf.run<DataStream<T>>(
      publish =>
        peer.ondatachannel = ({ channel }) => {
          const label = channel.label as keyof T | 'control'
          if (label === 'control') {
            if (mode === 'offer') {
              throw new Error(`error: answering side sent control channel`)
            }
            handover(channel)
          } else {
            console.log(`received channel ${channel.label}`)
            publish({ id: label, stream: rf.run<T[typeof label]>() })
          }
        }
    )

  }

}
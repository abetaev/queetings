/**
 * signalling connection over beacon server
 */

import { Connector, Receiver, Typed } from './types';

import { OutputMessage } from './../../beacon'

const { parse, stringify } = JSON

type RelayedConnection<T> = {
  connector: Connector<T>
  mode: 'host' | 'guest'
  host: string,
  guest: string
}

export default function <T extends Typed = any>(
  url: URL
): Receiver<Receiver<RelayedConnection<T>>> {
  const socket = new WebSocket(url.toString());

  const relayListeners: Receiver<RelayedConnection<T>>[] = []
  const connectionListeners: { [id: string]: Receiver<T>[] } = {}
  let host: string | null = null
  let guest: string | null = null

  const createRelayedConnection = (host: string, guest: string, mode: 'host' | 'guest'): RelayedConnection<T> => {
    connectionListeners[guest] = []
    const relayedConnection = {
      connector: (receiver: Receiver<T>) => {
        connectionListeners[guest].push(receiver)
        return {
          send: (message: T) => {
            socket.send(stringify({ type: 'data', to: guest, data: stringify(message) }))
          },
          close: () => {
            connectionListeners[guest] = connectionListeners[guest].filter(listener => listener !== receiver);
            this.send = () => { throw new Error('connection closed') }
          }
        }
      },
      mode,
      host: mode === 'guest' ? guest : host,
      guest: mode === 'host' ? host : guest
    }
    Object.values(relayListeners).forEach(listener => listener(relayedConnection))
    return relayedConnection;
  }

  socket.onmessage = (({ data }) => {
    const message: OutputMessage = parse(data)
    switch (message.type) {
      case 'host':
        host = message.host
        break;
      case 'guest':
        guest = message.guest
        createRelayedConnection(host, guest, 'host')
        break;
      case 'data':
        guest = message.guest
        if (!connectionListeners[guest]) {
          createRelayedConnection(host, guest, 'guest')
        }
        connectionListeners[guest].forEach(listener => listener(JSON.parse(message.data)))
        break;
    }
  })

  return (receive: Receiver<RelayedConnection<T>>) => {
    relayListeners.push(receive)
  }

}
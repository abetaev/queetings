/**
 * simple discovery service
 */

import Net, { Event as NetEvent, MessageSender, Service } from './../Net'


interface DiscoveryRequestMessage {
  type: 'discover'
}
interface DiscoveryResponseMessage {
  type: 'discovery'
  discovery: string[]
}
type Message =
  DiscoveryRequestMessage
  | DiscoveryResponseMessage


export interface DiscoveryServiceMessage {
  type: 'discovery'
  data: {
    link: string,
    knows: string[]
  }
}


export default class implements Service<Message> {

  readonly name: string = "disco"

  onNet(event: NetEvent, send: MessageSender<Message>): void {
    if (event.type === "join") {
      send({ type: 'discover' })
    }
  }

  receive(net: Net, route: string[], message: Message, reply: (message: Message) => void): void {
    if (route.length === 1) {
      // only near discovery for now
      switch (message.type) {
        case 'discover':
          reply({
            type: 'discovery',
            discovery: net.chain.list()
          })
          break;
        case 'discovery':
          net.emit(Object.assign({ net }, {
            type: 'discovery',
            data: {
              link: route[0],
              knows: message.discovery
            }
          }))
          break;
      }
    }
  }

}
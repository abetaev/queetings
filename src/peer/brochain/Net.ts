/**
 * discovery
 */

import Chain, { Event as ChainEvent } from './Chain'

interface DiscoveryRequestMessage {
  type: 'discover'
}
interface DiscoveryResponseMessage {
  type: 'discovery'
  discovery: string[]
}
interface DataMessage<T> {
  type: 'data'
  data: T
}
type Message =
  DiscoveryRequestMessage
  | DiscoveryResponseMessage

interface InviteEvent {
  type: 'invite'
  url: URL
}
type Handler = (url: URL) => void

type SpaceMap = { [id: string]: { knows: string[], state: 'active' | 'inactive' } }

export default class {

  public readonly chain: Chain<Message>

  private readonly spaceMap: SpaceMap = {}

  constructor(
    private handler: Handler,
    stunURLs: URL[]
  ) {
    this.chain = new Chain<Message>(
      async (event) => await this.on(event),
      (from, event) => this.receive(from, event),
      stunURLs
    )
  }

  private async on(event: ChainEvent): Promise<void> {
    switch (event.type) {
      case 'invite':
        this.handler(event.url)
        break;
      case 'join':
        this.spaceMap[event.from] = {
          knows: [],
          state: 'active'
        }
        console.log('sending discovery')
        this.chain.send({ type: 'discover' }, [event.from])
        break;
      case 'call':
        // take all by now..
        console.log(`taking call from ${event.from}`)
        await event.take()
        break;
    }
  }

  private receive(route: string[], event: Message): void {
    switch (event.type) {
      case 'discover':
        this.chain.send({
          type: 'discovery',
          discovery: this.chain.known()
        }, route)
        break;
      case 'discovery':
        const known = this.chain.known()
        event.discovery
          .filter(id => id !== this.chain.id)
          .filter(id => !known.includes(id))
          .forEach(id => this.chain.join(new URL(`bro:${route.join('/')}/${id}`)))
        break;
    }
  }

}
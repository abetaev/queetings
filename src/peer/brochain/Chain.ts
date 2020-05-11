/**
 * routing
 */

import { v4 as uuid } from 'uuid'
import makeLink, { Link, Event as LinkEvent, Connection } from './Link'
import Relay from './Relay'

export type Route = string[]
export type Event = { from: string }
  & LinkEvent
type EventHandler = (event: Event) => void

type DataHandler<T> = (path: string[], data: T) => void

interface CallPacket {
  type: 'call'
}

interface DataPacket<T> {
  type: 'data'
  data: T
}

interface SignallingPacket {
  type: 'signal'
  message: string
}

type Packet<T> =
  {
    route: {
      forward: string[]
      backward: string[]
    }
  } & (SignallingPacket
    | DataPacket<T>
    | CallPacket)


export type Links<T> = { [id: string]: Link<Packet<T>> }
export interface Chain<T> {
  readonly id: string
  join(url: URL): void
  send(message: T, route?: string[]): void
  play(stream: MediaStream, id?: string): void
  list(): string[]
  tear(id: string): void
  quit(): void
}

export default function<T> (
  eventHandler: EventHandler,
  dataHandler: DataHandler<T>
) {
  return new BroChain<T>(eventHandler, dataHandler)
}

class BroChain<T> implements Chain<T> {

  public readonly id = uuid()

  private readonly links: { [id: string]: Link<Packet<T>> } = {}

  private readonly signalling: { [id: string]: (message: string) => void } = {}

  constructor(
    private eventHandler: EventHandler,
    private dataHandler: DataHandler<T>
  ) { }

  join(entryPoint: URL) {
    switch (entryPoint.protocol) {
      case 'wss:':
        this.joinThroughRelay(entryPoint)
        break
      case 'bro:':
        this.joinThroughChain(entryPoint)
        break
    }
  }

  private joinThroughRelay(entryPoint: URL) {
    console.log(`joining through relay: ${entryPoint}`)
    let mode: 'offer' | 'answer'
    if (entryPoint.pathname === '/') {
      console.log("i'll be answering")
      mode = 'answer';
    } else {
      console.log("i'll be offering")
      mode = 'offer';
    }
    const relay = new Relay(entryPoint)
    const link = makeLink<Packet<T>>(
      this.id,
      (event: LinkEvent) => this.on(link, event),
      (source: string, data: Packet<T>) => this.route(source, data),
      mode, relay
    )
  }

  private joinThroughChain(entryPoint: URL) {
    console.log(`joining through chain: ${entryPoint}`)
    const route = entryPoint.pathname.split("/")
    const target = route[route.length - 1]
    if (!target) {
      throw new Error(`illegal join requese: ${entryPoint} - no target`)
    }
    const link = makeLink<Packet<T>>(
      this.id,
      (event: LinkEvent) => this.on(link, event),
      (source: string, data: Packet<T>) => this.route(source, data),
      'answer',
      this.openSignalling(route)
    )
    this.transmit({
      type: 'call',
      route: {
        forward: route,
        backward: [this.id]
      }
    })
  }

  private openSignalling(route: string[]): Connection {
    const target = route[route.length - 1]
    return {
      send: async (message) => this.sendSignal(message, route),
      receive: (receiver) => this.signalling[target] = receiver,
      close: () => delete this.signalling[target]
    };
  }

  private sendSignal(message: string, route: string[]) {
    this.transmit({
      type: 'signal',
      route: {
        forward: route,
        backward: [this.id]
      },
      message
    })
  }

  private route(source: string, packet: Packet<T>): void {
    const { backward, forward: [self, next, ...rest] } = packet.route
    if (backward[0] !== source) {
      console.log(`link ${source} sends messages without return address`)
      this.links[source].tear()
      return
    }
    if (self !== this.id) {
      console.log(`link ${source} routes incorrectly`)
      this.links[source].tear()
      return
    }
    if (next) {
      this.links[next].send(
        Object.assign({}, packet, {
          route: {
            backward: [self, ...backward],
            forward: [next, ...rest]
          }
        })
      )
    } else {
      switch (packet.type) {
        case 'call':
          const route = packet.route.backward
          const from = route[route.length - 1]
          this.eventHandler({
            type: 'call',
            from,
            take: async () => {
              console.log(`taking call from ${from} (chain)`)
              const link = makeLink<Packet<T>>(
                this.id,
                (event) => this.on(link, event),
                (source, data) => this.route(source, data),
                'offer',
                this.openSignalling(route)
              )
            }
          })
          break;
        case 'data':
          this.dataHandler(backward, packet.data);
          break;
        case 'signal':
          const source = backward[backward.length - 1]
          const relay = this.signalling[source]
          if (relay) {
            relay(packet.message)
          } else {
            throw new Error(`undeliverable signal ${packet.message}`)
          }
      }
    }
  }

  private on(source: Link<Packet<T>>, event: LinkEvent) {
    switch (event.type) {
      case 'join':
        console.log(`link ${source.id} joined`)
        this.links[source.id] = source
        break;
      case 'tear':
        delete this.links[source.id]
        break;
    }
    this.eventHandler(Object.assign({ from: source.id }, event))
  }

  public send(message: T, route?: string[]) {
    if (route) {
      this.transmit({
        type: 'data',
        route: {
          forward: route,
          backward: [this.id]
        },
        data: message
      })
    } else {
      // broadcast
      Object.keys(this.links)
        .forEach(id => this.send(message, [id]))
    }
  }

  private transmit(message: Packet<T>) {
    const [to] = message.route.forward
    if (!to) {
      throw new Error(`route cannot be empty`)
    }
    const link = this.links[to]
    if (link) {
      link.send(message)
    } else {
      console.log(`undeliverable message: ${JSON.stringify(message)}`)
    }
  }

  public play(stream: MediaStream, id?: string) {
    const link = this.links[id]
    if (link) {
      link.play(stream)
    } else {
      console.log(`unknown link ${id}`)
    }
  }

  public quit() {
    Object.values(this.links)
      .forEach(link => link.tear())
  }

  public tear(id: string) {
    const link = this.links[id]
    if (link) {
      link.tear()
    } else {
      throw new Error(`unknown link ${id}`)
    }
  }

  public list(): string[] {
    return Object.keys(this.links)
  }

}
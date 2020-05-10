/**
 * environment
 */

import Chain, { Event as ChainEvent } from './Chain'

export type NetEvent = { net: Net } & ChainEvent
export type ServiceEvent<T> = { net: Net, type: string, data: T }
export type Event =
  NetEvent
  | ServiceEvent<any>

export type MessageSender<T> = (message: T) => void
export interface Service<M> {
  readonly name: string
  onNet?(event: NetEvent, reply: MessageSender<M>): void
  onService?(net: Net, event: M): void
  receive?(net: Net, route: string[], message: M, reply: MessageSender<M>): void
}

interface Typed {
  type: string
}

export default class Net {

  public readonly chain: Chain<{ type: string }>

  private readonly services: Service<{ type: string }>[]

  constructor(
    services: Service<{ type: string }>[],
    stunURLs: URL[]
  ) {
    this.services = services
    this.chain = new Chain<{ type: string }>(
      async (event) => await this.on(event),
      (from, event) => this.receive(from, event),
      stunURLs
    )
  }

  private async on(event: ChainEvent): Promise<void> {
    Object.values(this.services)
      .forEach(({ onNet }) => onNet && onNet(
        Object.assign({ net: this }, event),
        msg => this.chain.send(msg, [event.from])
      ))
  }

  private receive(route: string[], message: Typed & any): void {
    Object.values(this.services)
      .forEach(({receive}) => receive && receive(this, route, message, msg => this.chain.send(msg, route)))
  }

  public emit(event: Typed & any) {
    Object.values(this.services)
      .forEach(({ onService }) => onService && onService(this, event))
  }

}
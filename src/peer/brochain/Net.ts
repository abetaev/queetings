/**
 * environment
 */

import makeChain, { Chain, Event as ChainEvent } from './Chain'

export type Event = { net: Net } & ChainEvent

export type MessageSender<T> = (message: T) => void
export interface Service<M = any> {
  readonly name: string
  onNet?(event: Event, reply: MessageSender<M>): void
  onService?(event: M, net: Net): void
  receive?(net: Net, route: string[], message: M, reply: MessageSender<M>): void
}

interface Typed {
  type: string
}

export default class Net {

  public readonly chain: Chain<{ type: string }>

  private readonly services: Service<{ type: string }>[]

  constructor(
    services: Service<{ type: string }>[]
  ) {
    this.services = services
    this.chain = makeChain<{ type: string }>(
      async (event) => await this.on(event),
      (from, event) => this.receive(from, event)
    )
  }

  public attach(service: Service) {
    this.services.push(service)
  }

  private async on(event: ChainEvent): Promise<void> {
    Object.values(this.services)
      .forEach((h) => h.onNet && h.onNet(
        Object.assign({ net: this }, event),
        msg => this.chain.send(msg, [event.from])
      ))
  }

  private receive(route: string[], message: Typed & any): void {
    Object.values(this.services)
      .forEach((h) => h.receive && h.receive(this, route, message, msg => this.chain.send(msg, route)))
  }

  public emit(event: Typed & any) {
    Object.values(this.services)
      .forEach((h) => h.onService && h.onService(event, this))
  }

}
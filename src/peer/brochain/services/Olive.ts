/**
 * hearbeat and monitoring
 */

import Net, { Event as NetEvent, Service } from '../Net'

export type HeartBeatMessage = {
  type: 'heartbeat'
}
export default class implements Service<HeartBeatMessage> {

  name = "o!live"

  private heartbeats: { [id: string]: number } = {}

  onNet(event: NetEvent): void {
    if (event.type === 'join') {
      this.up(event.net, event.from)
    } else if (event.type === 'tear') {
      this.down(event.from)
    }
  }

  private up(net: Net, to: string) {
    this.heartbeats[to] = 1
    this.beat(net, to)
    this.listen(net, to)
  }

  private down(to: string) {
    delete this.heartbeats[to]
  }

  private beat(net: Net, to: string) {
    net.chain.send({ type: 'heartbeat' })
    if (this.heartbeats[to] >= 0) {
      setTimeout(() => this.beat(net, to), 1000)
    } else {
      console.log(`stopping heartbeat ${to}`)
    }
  }
  private listen(net: Net, to: string) {
    if (this.heartbeats[to] > 0) {
      this.heartbeats[to] = 0
      setTimeout(() => this.listen(net, to), 5000)
    } else {
      console.log(`link ${to} does not send hearbeat`)
      net.chain.tear(to)
    }
  }

  receive(_net: Net, route: string[], message: HeartBeatMessage): void {
    if (route.length === 1) {
      const [to] = route
      if (message.type === 'heartbeat') {
        if (this.heartbeats[to] >= 0) {
          this.heartbeats[to]++
        }
      }
    }
  }

}
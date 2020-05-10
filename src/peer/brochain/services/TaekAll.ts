import Net, { Service, NetEvent } from '../Net'

export default class implements Service<any> {
  
  readonly name = "TaekAll"

  async onNet(event: NetEvent): Promise<void> {
    if (event.type === 'call') {
      console.log(`taking call from ${event.from}`)
      await event.take()
    }
  }

}
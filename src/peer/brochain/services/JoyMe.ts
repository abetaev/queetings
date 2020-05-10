import Net, { Service } from '../Net'
import { DiscoveryServiceMessage } from './Disco'


export default class implements Service<DiscoveryServiceMessage> {

  readonly name = 'joyME'

  onService(net: Net, event: DiscoveryServiceMessage): void {
    if (event.type === 'discovery') {
      event.data.knows
        .filter(id => net.chain.id != id)
        .filter(id => !net.chain.known().includes(id))
        .forEach(id => net.chain.join(new URL(`bro:${event.data.link}/${id}`)))
    }
  }

}
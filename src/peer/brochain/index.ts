/**
 * entry point
 */

import Net, { Service } from './Net'
import Disco from './services/Disco'
import JoyMe from './services/JoyMe'
import Olive from './services/Olive'
import TaekAll from './services/TaekAll'

export { Event as NetEvent, Service } from './Net'

export default (...services: Service<any>[]) => new Net(
  [new TaekAll, new Disco, new JoyMe, new Olive, ...services]
)
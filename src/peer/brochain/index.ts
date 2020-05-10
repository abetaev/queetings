import Net, { Service } from './Net'
import Disco from './services/Disco'
import JoyMe from './services/JoyMe'
import LowGo from './services/LowGo'
import TaekAll from './services/TaekAll'



const documentURL = new URL(document.URL)
const toURL = (url: string) => new URL(url)

export { NetEvent, Service } from './Net'

export default (...services: Service<any>[]) => new Net(
  [new TaekAll, new Disco, new JoyMe, ...services],
  ['stun:stun.l.google.com:19302', `stun:${documentURL.hostname}:3478`].map(toURL)
)
import { Meeting } from './Meeting'
import { NetworkEventHandler, Network } from '../model'

export function join(stream: MediaStream, eventHandler: NetworkEventHandler, url: URL): Network {
  return new Meeting(
    stream,
    url,
    eventHandler
  )
}
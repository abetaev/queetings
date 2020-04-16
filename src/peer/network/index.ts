import { Meeting } from './Meeting'
import { NetworkEventHandler, Network } from '../model'

export function join(stream: MediaStream, eventHandler: NetworkEventHandler, url: URL): Network {
  return new Meeting(
    stream,
    convertToBeaconUrl(url),
    eventHandler,
    extractInvitation(url)
  )
}

function extractInvitation(url: URL): URL | undefined {
  const join = url.searchParams.get("join")
  if (join) {
    return new URL(join)
  }
}

function convertToBeaconUrl(url: URL): URL {
  return new URL(`wss://${url.host}`)
}
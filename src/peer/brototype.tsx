import { h, render, Fragment } from 'preact'

import brochain, { NetEvent } from './brochain'

const toURL = (url: string) => new URL(url)
const notNull = (v: any) => v != null

const documentURL = new URL(document.URL)

const joinURLs = [
  documentURL.searchParams.get("join"),
  `wss://${documentURL.host}/`
].filter(notNull).map(toURL)

const [joinURL] = joinURLs

const net = brochain(
  {
    name: "invite handler",
    onNet(event: NetEvent) {
      if (event.type === 'invite') {
        alert(`${documentURL.protocol}//${documentURL.host}/?join=${encodeURIComponent(event.url.toString())}`)
      }
    }
  }
)

const BANANA = () => {
  net.chain.join(joinURL)
  return (
    <Fragment>
      <button onClick={() => net.chain.join(joinURLs[joinURLs.length - 1])}>PUSH</button>
      <button onClick={async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        net.chain.known().forEach(id => {
          net.chain.play(stream, id)
        })
      }}>SEND VIDEO</button>
    </Fragment>
  )
}

render(
  <BANANA />,
  document.body
)
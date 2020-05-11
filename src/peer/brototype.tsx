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
    name: "BROtoTYPE",
    onNet(event: NetEvent) {
      if (event.type === 'invite') {
        alert(`${documentURL.protocol}//${documentURL.host}/?join=${encodeURIComponent(event.url.toString())}`)
      } else if (event.type === 'stream') {
        const video = document.createElement("video")
        video.srcObject = event.stream
        video.load()
        video.play()
        video.autoplay = true
        document.body.appendChild(video)
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
        net.chain.known().forEach((id: string) => { net.chain.play(stream, id) })
      }}>SEND VIDEO</button>
    </Fragment>
  )
}

render(
  <BANANA />,
  document.body
)
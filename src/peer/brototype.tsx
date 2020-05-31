import { h, render } from 'preact'
import { v4 as uuid } from 'uuid'
import link from './brochain/link'
import relay from './brochain/relay'
import { Video } from './videobar/video'

const documentURL = new URL(document.URL)

const beaconURL = new URL(`wss://${documentURL.host}${documentURL.pathname}`)

function run(stream: MediaStream) {
  render(
    <Video stream={stream} style={{ maxWidth: "100vw", maxHeight: "100vh" }} />,
    document.getElementById("container")
  )
}

relay(beaconURL)(async ({ connector, mode }) => {
  const me = uuid()
  let host: string = null
  connector(message => {
    switch(message.type) {
      
    }
  })
  const { send } = link(me, mode === 'host' ? 'offer' : 'answer', connector)((event) => {
    switch (event.type) {
      case 'offer':
        console.log('accepting offer')
        event.accept()
        break;
      case 'answer':
        console.log('confirming answer')
        event.confirm()
        break;
      case 'join':
        if (mode === 'host') {
          render(
            <button id="target"
              style={{ width: "100%", height: "100%" }}
              onClick={async () => {
                const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia()
                send({ type: 'media', stream })
                run(stream)
              }}>PUSH</button>,
            document.getElementById("container")
          )
        }
        break;
      case 'drop':
        if (event.from === host) {
          render(
            "goodbye!",
            document.getElementById("container")
          )
        }
        break;
      case 'media':
        run(event.stream)
        if (event.from !== me) {
          host = event.from
        }
        break;
    }
  })

})

render(
  <main id="container" />,
  document.body
)
import { h, render } from 'preact'
import link from './brochain/link'
import relay from './brochain/relay'
import rf from 'purefi'
const documentURL = new URL(document.URL);
const relayURL = new URL(`wss://${documentURL.host}/`)

const { connect, streams } = relay<any>(relayURL, (id) => {
  console.log(`received my id: ${id}`)
})

streams.subscribe(({ id, mode, stream }) => {
  console.log(`received relayed stream: ${id}/${mode}`)
  setTimeout(() => stream.publish('hello'), 1000)
})

render(
  <main id="container">
    <input type="text" id="peer" />
    <button onClick={() => {
      const id = (document.getElementById("peer") as HTMLInputElement).value
      connect(id)
    }}>connect</button>
  </main>,
  document.body
)


/**
 * entry point
 */

import { h, render, Component } from 'preact'
import './main.css'
import { join } from './network'
import UI from './ui'
import { Network, NetworkEvent } from './model';

class Queetings extends Component<{}, { network: Network, message?: { from: string, data: string } }> {

  render() {
    if (this.state.network) {
      window['network'] = this.state.network
      return <UI network={this.state.network} message={this.state.message} />
    } else {
      return <button
        class="enter"
        onClick={() => {
          navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
              if (window['webview']) {
                stream.getAudioTracks()[0].stop()
              }
              const network = join(
                stream,
                event => this.handle(event),
                new URL(document.URL)
              )
              this.setState({ network })
            })
        }}>video BAR</button>
    }
  }

  handle({ network, connectionId, data }: NetworkEvent) {
    if (network.connections[connectionId]) {
      if (data) {
        this.setState({ network, message: { from: connectionId, data } })
      } else {
        this.setState({ network })
      }
    } else {
      this.setState({ network })
    }
  }

}

setTimeout(() => render(
  <Queetings />,
  document.body
), 1000)

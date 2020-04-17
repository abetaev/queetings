/**
 * entry point
 */

import { h, render, Component } from 'preact'
import './main.css'
import { join } from './network'
import UI from './ui'
import { Network, NetworkEvent } from './model';


class Queetings extends Component<{}, { network: Network }> {

  constructor() {
    super()
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        const network = join(
          stream,
          event => this.handle(event),
          new URL(document.URL)
        )
        this.setState({ network })
      })
  }

  render() {
    if (this.state.network) {
      window['network'] = this.state.network
      return <UI network={this.state.network} />
    } else {
      return null
    }
  }

  handle({ network, connectionId, data }: NetworkEvent) {
    if (network.connections[connectionId]) {
      if (data) {
        // received message
      } else {
        this.setState({ network })
      }
    } else {
      this.setState({ network })
    }
  }

}

render(
  <Queetings />,
  document.body
)

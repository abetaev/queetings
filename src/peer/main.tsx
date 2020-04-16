/**
 * entry point
 */

import { h, render } from 'preact'
import './main.css'
import { join } from './network'
import Queetings from './ui'

navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then((stream) => {
    const network = join(
      stream,
      ({ network }) => {
        console.log('updated network')
        console.log(network)
        render(
          <Queetings network={network} />,
          document.body
        )
      },
      new URL(document.URL)
    )
    render(
      <Queetings network={network} />,
      document.body
    )
  })



/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import { Network } from '../model'
import bgBeer from './assets/bg_beer.png'
import bgWhisky from './assets/bg_withkey.png'
import Copy from './features/copy'
import Mail from './features/email'
import Paste from './features/paste'
import Telegram from './features/telegram'
import Viber from './features/viber'
import WhatsApp from './features/whatsapp'
import Item from './item'
import Nav from './nav'
import { Video } from './video'


const webview = window['unweb']

let color = '#000'
function switchBrightness() {
  if (color === "#FFF") {
    color = '#000'
  } else {
    color = '#FFF'
  }
  document.body.style.backgroundColor = color;
}

function switchBackground() {
  const current = document.body.style.backgroundImage
  const w = `url("${bgWhisky}")`
  const b = `url("${bgBeer}")`
  if (current === w) {
    document.body.style.backgroundImage = b
  } else if (current !== b) {
    document.body.style.backgroundImage = w
  } else {
    document.body.style.backgroundImage = ""
  }
}

function toggleVideo(stream: MediaStream) {
  stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled
}

function toggleAudio(stream: MediaStream) {
  stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled
}

export default ({ network }: { network: Network }) => (
  <Fragment>
    <Video stream={network.stream} muted />
    <Nav>
      <Item>
        <Paste network={network} />
      </Item>
      <Item>
        <Mail network={network} />
        <Copy network={network} />
        <Telegram network={network} />
        <Viber network={network} />
        <WhatsApp network={network} />
      </Item>
      <Item>
        <IconButton onClick={() => toggleVideo(network.stream)}>
          <IconButton.Icon on>videocam_off</IconButton.Icon>
          <IconButton.Icon>videocam</IconButton.Icon>
        </IconButton>
        <IconButton onClick={() => toggleAudio(network.stream)}>
          <IconButton.Icon on>mic_off</IconButton.Icon>
          <IconButton.Icon>mic</IconButton.Icon>
        </IconButton>
      </Item>
      <Item>
        <IconButton onClick={() => switchBackground()}>
          <IconButton.Icon on>local_bar</IconButton.Icon>
          <IconButton.Icon>local_bar</IconButton.Icon>
        </IconButton>
        <IconButton onClick={() => switchBrightness()}>
          <IconButton.Icon on>brightness_low</IconButton.Icon>
          <IconButton.Icon>brightness_high</IconButton.Icon>
        </IconButton>
      </Item>
    </Nav>
  </Fragment>
)

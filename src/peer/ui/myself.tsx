/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import {Fragment, h} from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import {Network} from '../model'
import Copy from './features/copy'
import Mail from './features/email'
import Paste from './features/paste'
import Telegram from './features/telegram'
import Viber from './features/viber'
import WhatsApp from './features/whatsapp'
import Item from './item'
import Nav from './nav'
import {Video} from './video'
import * as styles from './myself.css'
import {EventEmitter, EventTypes} from "./events/eventEmitter";
import {useState} from "preact/hooks";


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
  if(document.body.classList.contains(styles.bodyBackgroundBar)) {
    EventEmitter.dispatch(EventTypes.BAR_VIEW_DECORATION_IS_CHANGED, { opacity: 1 } )
    document.body.classList.replace(styles.bodyBackgroundBar, styles.bodyBackgroundWhiskey)
  } else if (document.body.classList.contains(styles.bodyBackgroundWhiskey)) {
    document.body.classList.replace(styles.bodyBackgroundWhiskey, styles.bodyBackgroundBeer)
  } else if (document.body.classList.contains(styles.bodyBackgroundBeer)) {
    document.body.classList.remove(styles.bodyBackgroundBeer)
  } else {
    document.body.classList.add(styles.bodyBackgroundBar)
    EventEmitter.dispatch(EventTypes.BAR_VIEW_DECORATION_IS_CHANGED, { opacity: 0.5 } )
  }
}

function toggleVideo(stream: MediaStream) {
  stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled
}

function toggleAudio(stream: MediaStream) {
  stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled
}

export default ({ network }: { network: Network }) => {
  const [barVideoCssOptions, setBarVideoCssOptions] = useState({ opacity: 1 })
  EventEmitter.subscribe(EventTypes.BAR_VIEW_DECORATION_IS_CHANGED, setBarVideoCssOptions)

  return (
    <Fragment>
      <Video stream={network.stream} muted style={{...barVideoCssOptions}} />
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
}

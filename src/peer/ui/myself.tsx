/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import clipboard from 'clipboard-polyfill'
import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import TextField, { TextFieldInput } from 'preact-material-components/ts/TextField'
import { Network } from '../model'
import bgBeer from './assets/bg_beer.png'
import bgWhisky from './assets/bg_withkey.png'
import TelegramIcon from './assets/telegram.png'
import Item from './item'
import Nav from './nav'
import { Video } from './video'

const baseUrl = new URL('/', document.URL).toString()

function wrap(url: URL): URL {
  return new URL(`${baseUrl}?join=${encodeURI(url.toString())}`)
}

function telegram(url: URL) {
  window.open(`tg://msg_url?url=${encodeURI(url.toString())}`)
}

function email(url: URL) {
  window.open(`mailto:?body=${encodeURI(url.toString())}`)
}

async function copy(url: URL) {
  try {
    await clipboard.writeText(url.toString())
    alert('link copied to clipboard')
  } catch (error) {
    alert(`failed to copy link: ${error}`)
  }
}

function switchBrightness() {
  const current = document.body.style.backgroundColor
  console.log(current)
  if (current === "black") {
    document.body.style.backgroundColor = "white";
  } else {
    document.body.style.backgroundColor = "black";
  }
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
      <TextField type="url" leadingIcon="link" dense outlined
        onChange={({ target }) => {
          try {
            const url = new URL(target.value)
            const invitation = url.protocol === 'wss' ? target.value : url.searchParams.get('join')
            network.accept(invitation)
          } finally {
            target.value = ""
          }
        }} >
        <TextFieldInput />
      </TextField>
      <Item>
        <Item>
          <IconButton onClick={() => network.invite(url => copy(wrap(url)))}>
            <IconButton.Icon on>link</IconButton.Icon>
            <IconButton.Icon>link</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => network.invite(url => email(wrap(url)))}>
            <IconButton.Icon on>alternate_email</IconButton.Icon>
            <IconButton.Icon>alternate_email</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => network.invite(url => telegram(wrap(url)))}>
            <img src={TelegramIcon} style={{ height: '100%' }} />
          </IconButton>
        </Item>
        <Item>
          <IconButton onClick={() => toggleVideo(network.stream)}>
            <IconButton.Icon on>videocam_off</IconButton.Icon>
            <IconButton.Icon>videocam</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => toggleAudio(network.stream)}>
            <IconButton.Icon on>volume_off</IconButton.Icon>
            <IconButton.Icon>volume_up</IconButton.Icon>
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
      </Item>
    </Nav>
  </Fragment>
)

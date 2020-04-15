/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import { h, Fragment } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import TextField, { TextFieldInput } from 'preact-material-components/ts/TextField'
import { Meeting } from './network'
import * as NETWORK from './network'
import TelegramIcon from './assets/telegram.png'
import { Video } from './video'
import bgWhisky from './assets/bg_withkey.png'
import bgBeer from './assets/bg_beer.png'
import Item from './item'
import Nav from './nav'
import clipboard from 'clipboard-polyfill'

const sendTo = (meeting: Meeting, handler: (peer: string) => void) => {
  NETWORK.issueInvitation(
    meeting,
    url => {
      const documentURL = new URL(document.URL)
      handler(`${documentURL.protocol}//${documentURL.host}/?join=${encodeURI(url.toString())}`)
    }
  )
}
function telegram(meeting: Meeting) {
  sendTo(
    meeting,
    (url) => window.open(`tg://msg_url?url=${encodeURI(url)}`)
  )
}
function email(meeting: Meeting) {
  sendTo(
    meeting,
    (url) => window.open(`mailto:?body=${encodeURI(url)}`)
  )
}

function copy(meeting: Meeting) {
  sendTo(
    meeting,
    async (url) => {
      try {
        await clipboard.writeText(url.toString())
        alert('link copied to clipboard')
      } catch (error) {
        alert(`failed to copy link: ${error}`)
      }
    }
  )
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

export default ({ meeting }: { meeting: Meeting }) => (
  <Fragment>
    <Video stream={meeting.stream} muted />
    <Nav>
      <TextField type="url" leadingIcon="link" dense outlined
        onChange={({ target }) => {
          try {
            const url = new URL(target.value)
            const invitation = url.protocol === 'wss' ? target.value : url.searchParams.get('join')
            NETWORK.acceptInvitation(meeting, invitation)
          } finally {
            target.value = ""
          }
        }} >
        <TextFieldInput />
      </TextField>
      <Item>
        <Item>
          <IconButton onClick={() => copy(meeting)}>
            <IconButton.Icon on>link</IconButton.Icon>
            <IconButton.Icon>link</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => email(meeting)}>
            <IconButton.Icon on>alternate_email</IconButton.Icon>
            <IconButton.Icon>alternate_email</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => telegram(meeting)}>
            <img src={TelegramIcon} style={{ height: '100%' }} />
          </IconButton>
        </Item>
        <Item>
          <IconButton onClick={() => toggleVideo(meeting.stream)}>
            <IconButton.Icon on>videocam_off</IconButton.Icon>
            <IconButton.Icon>videocam</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => toggleAudio(meeting.stream)}>
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

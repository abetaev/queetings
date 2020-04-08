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
import bgWhisky from './assets/bg_withkey.jpg'
import bgBeer from './assets/bg_beer.jpg'

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
    (url) => window.open(`https://telegram.me/share/url?url=${encodeURI(url)}`)
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
        await navigator.clipboard.writeText(url.toString())
        alert('link copied to clipboard')
      } catch (error) {
        alert(`failed to copy link: ${error}`)
      }
    }
  )
}

function switchbg() {
  const current = document.body.style.backgroundImage
  const w = `url("${bgWhisky}")`
  const b = `url("${bgBeer}")`
  if (current === w) {
    document.body.style.backgroundImage = b
  } else {
    document.body.style.backgroundImage = w
  }
}

export default ({ meeting }: { meeting: Meeting }) => (
  <Fragment>
    <Video stream={meeting.stream} muted />
    <div class="videoControls">
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
        <TextFieldInput/>
      </TextField>
      <IconButton onClick={() => copy(meeting)}>
        <IconButton.Icon on={true}>link</IconButton.Icon>
        <IconButton.Icon on={false}>link</IconButton.Icon>
      </IconButton>
      <IconButton onClick={() => email(meeting)}>
        <IconButton.Icon on={true}>alternate_email</IconButton.Icon>
        <IconButton.Icon on={false}>alternate_email</IconButton.Icon>
      </IconButton>
      <IconButton onClick={() => telegram(meeting)}>
        <img src={TelegramIcon} style={{ height: '100%' }} />
      </IconButton>
      <IconButton onClick={() => switchbg()}>
        <IconButton.Icon on={true}>local_bar</IconButton.Icon>
        <IconButton.Icon on={false}>local_bar</IconButton.Icon>
      </IconButton>
    </div>
  </Fragment>
)

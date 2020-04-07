/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import { h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import { Meeting } from './network'
import * as NETWORK from './network'
import TelegramIcon from './assets/telegram.png'
import { Video } from './video'
import { useState } from 'preact/hooks'

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

export default ({ meeting }: { meeting: Meeting }) => {
  const [open, setOpen] = useState(false)

  return (
    <aside>
      <div style={{ display: open ? 'block' : 'none', cursor: 'pointer' }}>
        <IconButton onClick={() => { copy(meeting); setOpen(false) }}>
          <IconButton.Icon on={true}>link</IconButton.Icon>
          <IconButton.Icon on={false}>link</IconButton.Icon>
        </IconButton>
        <IconButton onClick={() => { email(meeting); setOpen(false) }}>
          <IconButton.Icon on={true}>alternate_email</IconButton.Icon>
          <IconButton.Icon on={false}>alternate_email</IconButton.Icon>
        </IconButton>
        <IconButton onClick={() => { telegram(meeting); setOpen(false) }}>
          <img src={TelegramIcon} style={{ height: '100%' }} />
        </IconButton>
      </div>
      <Video stream={meeting.stream} muted onClick={() => setOpen(!open)} />
    </aside>
  )
}
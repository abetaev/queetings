import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import { useState } from 'preact/hooks'
import { Connection } from '../model'
import Item from './item'
import Nav from './nav'
import { Video } from './video'

type Props = { connection: Connection, message?: string }
export default ({ connection, message }: Props) => {
  const [muted, mute] = useState<boolean>(false)
  const [{ color, colorLock }, setColor] = useState({ color: "transparent", colorLock: "transparent" })
  if (message && message !== colorLock) {
    setColor({ color: message, colorLock: message })
    setTimeout(
      () => setColor({ color: "transparent", colorLock: message }),
      5000
    )
  }
  return (
    <Fragment>
      <Video stream={connection.stream} muted={muted} style={{ backgroundColor: color }} />
      <Nav>
        <Item>
          <IconButton onClick={() => mute(!muted)}>
            <IconButton.Icon on>volume_off</IconButton.Icon>
            <IconButton.Icon>volume_up</IconButton.Icon>
          </IconButton>
        </Item>
        <Item>
          <IconButton onClick={() => connection.send('red')}>
            <IconButton.Icon on>thumb_down</IconButton.Icon>
            <IconButton.Icon>thumb_down</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => connection.send('green')}>
            <IconButton.Icon on>thumb_up</IconButton.Icon>
            <IconButton.Icon>thumb_up</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => connection.send('blue')}>
            <IconButton.Icon on>pan_tool</IconButton.Icon>
            <IconButton.Icon>pan_tool</IconButton.Icon>
          </IconButton>
        </Item>
      </Nav>
    </Fragment>
  )
}
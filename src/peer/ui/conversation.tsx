import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import { useState } from 'preact/hooks'
import { Connection } from '../model'
import Item from './item'
import Nav from './nav'
import { Video } from './video'

type Props = { connection: Connection }
export default ({ connection }: Props) => {
  const [muted, mute] = useState<boolean>(false)
  function send(color: string) {
    connection.send(color)
  }

  const [color, setColor] = useState("transparent")

  // connection.onData = (color) => {
  //   setColor(color)
  //   setTimeout(() => setColor("transparent"), 5000);
  // }
  return (
    <Fragment>
      <Video stream={connection.stream} muted={muted} style={{backgroundColor: color}}/>
      <Nav>
        <Item>
          <IconButton onClick={() => send('blue')}>
            <IconButton.Icon on>pan_tool</IconButton.Icon>
            <IconButton.Icon>pan_tool</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => send('green')}>
            <IconButton.Icon on>thumb_up</IconButton.Icon>
            <IconButton.Icon>thumb_up</IconButton.Icon>
          </IconButton>
          <IconButton onClick={() => send('red')}>
            <IconButton.Icon on>thumb_down</IconButton.Icon>
            <IconButton.Icon>thumb_down</IconButton.Icon>
          </IconButton>
        </Item>
        <Item>
          <IconButton onClick={() => mute(!muted)}>
            <IconButton.Icon on>volume_off</IconButton.Icon>
            <IconButton.Icon>volume_up</IconButton.Icon>
          </IconButton>
        </Item>
      </Nav>
    </Fragment>
  )
}
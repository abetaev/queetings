import { Fragment, h } from 'preact'
import Nav from './nav'
import { Conversation } from './network'
import { Video } from './video'
import { useState } from 'preact/hooks'
import IconButton from 'preact-material-components/ts/IconButton'
import Item from './item'

type Props = { conversation: Conversation }
export default ({ conversation }: Props) => {
  const [muted, mute] = useState<boolean>(false)
  function send(color: string) {
    conversation.controlChannel.send(
      JSON.stringify({ type: 'data', data: color })
    )
  }

  const [color, setColor] = useState("transparent")

  conversation.onData = (color) => {
    setColor(color)
    setTimeout(() => setColor("transparent"), 5000);
  }
  return (
    <Fragment>
      <Video stream={conversation.stream} muted={muted} style={{backgroundColor: color}}/>
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
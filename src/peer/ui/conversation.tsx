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
  return (
    <Fragment>
      <Video stream={connection.stream} muted={muted} />
      <Nav>
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
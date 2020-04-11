import { Fragment, h } from 'preact'
import Controls from './controls'
import { Conversation } from './network'
import { Video } from './video'
import { useState } from 'preact/hooks'
import IconButton from 'preact-material-components/ts/IconButton'

type Props = { conversation: Conversation }
export default ({ conversation }: Props) => {
  const [muted, mute] = useState<boolean>(false)
  return (
    <Fragment>
      <Video stream={conversation.stream} muted={muted} />
      <Controls>
        <IconButton onClick={() => mute(!muted)}>
          <IconButton.Icon on={true}>volume_off</IconButton.Icon>
          <IconButton.Icon>volume_up</IconButton.Icon>
        </IconButton>
      </Controls>
    </Fragment>
  )
}
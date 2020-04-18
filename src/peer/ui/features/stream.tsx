import { Fragment, h } from 'preact'
import Item from '../item'
import IconButton from 'preact-material-components/ts/IconButton'

function toggleVideo(stream: MediaStream) {
  stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled
}

function toggleAudio(stream: MediaStream) {
  stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled
}

export default ({ stream }: { stream: MediaStream }) => (
  <Item>
    <IconButton onClick={() => toggleVideo(stream)}>
      <IconButton.Icon on>videocam_off</IconButton.Icon>
      <IconButton.Icon>videocam</IconButton.Icon>
    </IconButton>
    <IconButton onClick={() => toggleAudio(stream)}>
      <IconButton.Icon on>mic_off</IconButton.Icon>
      <IconButton.Icon>mic</IconButton.Icon>
    </IconButton>
  </Item>
)
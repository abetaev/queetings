/**
 * application itself
 * integrates user interface and network features
 */

import { h, Fragment } from 'preact'
import 'preact-material-components/style.css'
import { useState } from 'preact/hooks'
import * as NETWORK from './network'
import { Meeting } from './network'
import uuid = require('uuid')
import { Video } from './video'
import Layout from './layout'
import Menu from './menu'

let beaconServer = `wss://${(new URL(document.URL)).host}/`

export default () => {

  const [{ meeting, version }, update] = useState<{ meeting: Meeting, version: number }>({
    meeting: {
      network: {
        id: uuid(),
        peers: []
      },
      beaconServer,
      conversations: {},
      on: () => update({ meeting, version: version + 1 }),
      stream: null
    },
    version: 0
  })

  if (meeting.stream === null) {
    (async () => {
      let audio = false;
      let video = false;
      (await navigator.mediaDevices.enumerateDevices()).forEach(({ kind }) => {
        if (kind === "videoinput") { video = true }
        else if (kind === "audioinput") { audio = true }
      });

      if (!audio) {
        throw new Error("audio device is not available")
      }
      if (!video) {
        console.log("video device is not available")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio, video })
      meeting.stream = stream

      const invitation = new URL(document.URL).searchParams.get('join')
      invitation && NETWORK.acceptInvitation(meeting, invitation)
        .catch(error => alert(`failed to accept invitation: ${error.toString()}`))
      update({ meeting, version: version + 1 })
    })()
  }

  return (
    <Fragment>
      <Layout
        menu={<Menu meeting={meeting} />}
        tiles={
          Object.keys(meeting.conversations)
            .map((peerId) => <Video stream={meeting.conversations[peerId].stream} />)
        } />
    </Fragment>
  )
}

/**
 * entry point
 */

import { h, render } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import './main.css';
import { Network, NetworkEvent } from './model';
import { Meeting } from './network/Meeting';
import PrivacyPolicy from './PrivacyPolicy';
import UI from './ui';

type Connection = {
  network?: Network
  message?: {
    from: string
    data: string
  }
}

function useConnection() {
  const [connection, setConnection] = useState<Connection>({})
  function handle({ network, connectionId, data }: NetworkEvent) {
    if (!network) {
      setConnection({})
    } else if (network.connections[connectionId]) {
      if (data) {
        setConnection({ network, message: { from: connectionId, data } })
      } else {
        setConnection({ network })
      }
    } else {
      setConnection({ network })
    }
  }

  const join = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (window['webview']) {
          stream.getAudioTracks()[0].stop()
        }
        setConnection({
          network: new Meeting(
            stream,
            new URL(document.URL),
            event => handle(event)
          )
        })
      })
  }, [connection.network])

  return { connection, join }
}

const Network = () => {
  const { connection, join } = useConnection()
  if (connection.network) {
    window['network'] = connection.network
    return <UI network={connection.network} message={connection.message} />
  } else {
    return <button class="enter" onClick={join}>video BAR</button>
  }
}

const View = () => (
  new URL(document.URL).searchParams.get("privacyPolicy") !== null ? (
    <PrivacyPolicy />
  ) : (
      <Network />
    )
)


setTimeout(() => render(
  <View />,
  document.body
), 500)

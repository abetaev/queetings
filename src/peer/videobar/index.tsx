/**
 * application itself
 * integrates user interface and network features
 */

import { h } from 'preact'
import 'preact-material-components/style.css'
import { Network } from '../model'
import Conversation from './conversation'
import Flow from './flow'
import Myself from './myself'

export default ({ network }: { network: Network }) => {
  return (
    <Flow
      head={<Myself network={network} />}
      tail={
        Object.values(network && network.connections || {})
          .map((conversation) => (
             <Conversation connection={conversation} />
          ))
      } />
  )
}

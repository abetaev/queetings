/**
 * this is main control component for the whole thing
 * all buttons related to primary features are here
 */

import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import { Network } from '../model'
import Accept from './features/accept'
import Item from './item'
import Nav from './nav'

import Invite from './features/invite'
import Appearance from './features/appearance'
import Stream from './features/stream'
import Exit from './features/exit'
import { Video } from './video'

export default ({ network }: { network: Network }) => (
  <Fragment>
    <Video stream={network.stream} muted />
    <Nav>
      <Accept network={network} />
      <Invite network={network} />
      <Stream stream={network.stream} />
      <Appearance />
      <Exit network={network} />
    </Nav>
  </Fragment>
)

import { h } from 'preact'

import './nav.css'

export default ({ children }) => (
  <nav>
    <span>
      {children}
    </span>
  </nav>
)
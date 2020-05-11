import { h } from 'preact'

import './nav.css'

export default ({ children }) => (
  <nav>
    <span>
      <div>
        {children}
      </div>
    </span>
  </nav>
)
import { h } from 'preact'
import * as styles from './item.css'

export default ({ children }) => (
  <span class={styles.item}>
    {children}
  </span>
)

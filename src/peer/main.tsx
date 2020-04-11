/**
 * entry point
 */

import { h, render } from 'preact'
import Queetings from './queetings'
import './main.css'

render(
  <Queetings/>,
  document.body
)
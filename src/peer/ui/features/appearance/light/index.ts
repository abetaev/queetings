import './index.css'
import { rollingStyles } from '..'

const modes = ['dark', 'light']

export function toggleLight() {
  rollingStyles(document.body, modes)
}

import './index.css'
import { rollingStyles } from '..'

const modes = ['dark', 'light']

export default function() {
  rollingStyles(document.body, modes)
}

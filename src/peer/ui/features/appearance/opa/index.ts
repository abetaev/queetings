import './index.css'
import { rollingStyles } from '..'

const modes = ['opaque', 'opaque_1', 'opaque_2']

export default function() {
  rollingStyles(document.body, modes)
}

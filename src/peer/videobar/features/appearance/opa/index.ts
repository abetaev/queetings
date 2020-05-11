import './index.css'
import { rollingStyles } from '..'

const modes = ['opaque', 'opaque_1', 'opaque_2', 'opaque_3']

export default function() {
  rollingStyles(document.body, modes)
}

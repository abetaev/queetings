import './index.css'
import { rollingStyles } from '..'

const modes = ['mini', 'maxi']

export default function() {
  rollingStyles(document.body, modes)
}

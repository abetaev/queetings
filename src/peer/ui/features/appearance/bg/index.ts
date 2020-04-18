import './index.css'
import { rollingStyles } from '..'

const backgrounds = ['bar', 'beer', 'wisky', 'empty']

export default function() {
  rollingStyles(document.body, backgrounds)
}

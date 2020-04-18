import './index.css'
import { rollingStyles } from '..'

const backgrounds = ['bg-bar', 'bg-bar-t', 'bg-beer', 'bg-wisky']

export function switchBackground() {
  rollingStyles(document.body, backgrounds)
}

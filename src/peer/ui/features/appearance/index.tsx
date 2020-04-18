import { Fragment, h } from 'preact'
import bgBeer from './bg_beer.png'
import bgWhisky from './bg_wisky.png'
import Item from '../../item'
import IconButton from 'preact-material-components/ts/IconButton'

let color = '#000'
function switchBrightness() {
  if (color === "#FFF") {
    color = '#000'
  } else {
    color = '#FFF'
  }
  document.body.style.backgroundColor = color;
}

function switchBackground() {
  const current = document.body.style.backgroundImage
  const w = `url("${bgWhisky}")`
  const b = `url("${bgBeer}")`
  if (current === w) {
    document.body.style.backgroundImage = b
  } else if (current !== b) {
    document.body.style.backgroundImage = w
  } else {
    document.body.style.backgroundImage = ""
  }
}

export default () => (
  <Fragment>
    <Item>
      <IconButton onClick={() => switchBackground()}>
        <IconButton.Icon on>local_bar</IconButton.Icon>
        <IconButton.Icon>local_bar</IconButton.Icon>
      </IconButton>
      <IconButton onClick={() => switchBrightness()}>
        <IconButton.Icon on>brightness_low</IconButton.Icon>
        <IconButton.Icon>brightness_high</IconButton.Icon>
      </IconButton>
    </Item>
  </Fragment>
)
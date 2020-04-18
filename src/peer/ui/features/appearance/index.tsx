import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import Item from '../../item'
import './bg/index.css'
import { switchBackground } from './bg'
import { toggleLight as toggleLights } from './light'

export const rollingStyles = (element: HTMLElement, themes: string[]) => {
  const classes = element.classList
  let next = 0;
  for (let i = 0; i < themes.length; i ++) {
    if (classes.contains(themes[i])) {
      classes.remove(themes[i])
      next = i;
    }
  }
  next ++;
  if (next === themes.length) {
    next = 0;
  }
  classes.add(themes[next])
}

export default () => (
  <Fragment>
    <Item>
      <IconButton onClick={() => switchBackground()}>
        <IconButton.Icon on>local_bar</IconButton.Icon>
        <IconButton.Icon>local_bar</IconButton.Icon>
      </IconButton>
      <IconButton onClick={() => toggleLights()}>
        <IconButton.Icon on>brightness_low</IconButton.Icon>
        <IconButton.Icon>brightness_high</IconButton.Icon>
      </IconButton>
    </Item>
  </Fragment>
)
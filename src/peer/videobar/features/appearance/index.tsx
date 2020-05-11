import { Fragment, h } from 'preact'
import IconButton from 'preact-material-components/ts/IconButton'
import Item from '../../item'
import switchBackground from './bg'
import toggleLights from './light'
import toggleOpacity from './opa'
import toggleSize from './size'

export const rollingStyles = (element: HTMLElement, themes: string[]) => {
  const classes = element.classList
  let next = 0;
  for (let i = 0; i < themes.length; i++) {
    if (classes.contains(themes[i])) {
      classes.remove(themes[i])
      next = i;
    }
  }
  next++;
  if (next === themes.length) {
    next = 0;
  }
  classes.add(themes[next])
}

const Button = ({ icon, icon2, handler }: { icon: string, icon2?: string, handler: () => void }) => (
  <IconButton onClick={() => handler()}>
    <IconButton.Icon on>{icon}</IconButton.Icon>
    <IconButton.Icon>{icon2 ? icon2 : icon}</IconButton.Icon>
  </IconButton>
)

export default () => (
  <Fragment>
    <Item>
      <Button icon="local_bar" handler={() => switchBackground()} />
      <Button icon="brightness_low" icon2="brightness_high"
            handler={() => toggleLights()} />
      <Button icon="opacity" handler={() => toggleOpacity()} />
      <Button icon="aspect_ratio" handler={() => toggleSize()} />
    </Item>
  </Fragment>
)
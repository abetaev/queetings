import * as clipboard from 'clipboard-polyfill';
import { h, Fragment } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../../model";
import Item from "../../item";
import EmailIcon from './email.png';
import TelegramIcon from './telegram.png';
import ViberIcon from './viber.png';
import WhatsappIcon from './whatsapp.png';


const baseUrl = new URL('/', document.URL).toString()
export function wrap(url: URL): URL {
  return new URL(`${baseUrl}?join=${encodeURIComponent(url.toString())}`)
}

function telegram(url: URL) {
  window.open(`https://telegram.me/share/url?url=${encodeURI(url.toString())}`)
}

function viber(url: URL) {
  window.open(`viber://pa?chatURI=&text=${url.toString()}`)
}

function whatsapp(url: URL) {
  window.open(`https://wa.me/?text=${encodeURI(url.toString())}`)
}

function email(url: URL) {
  window.open(`mailto:?body=${encodeURI(url.toString())}`)
}

export async function copy(url: URL) {
  try {
    await clipboard.writeText(url.toString())
    alert('link copied to clipboard')
  } catch (error) {
    alert(`failed to copy link: ${error}`)
  }
}

export default ({ network }: { network: Network }) => {
  type ShareButtonProps = {
    callback: (url: URL) => void
  } & ({
    image: string
    icon?: undefined
  } | {
    icon: string
    image?: undefined
  })
  const ShareButton = (props: ShareButtonProps) => (
    <IconButton onClick={() => network.invite(
      (url: URL) => props.callback(wrap(url))
    )}>
      {props.image ? (
        <img src={props.image} style={{ height: "100%" }} />
      ) : (
          <Fragment>
            <IconButton.Icon on>{props.icon}</IconButton.Icon>
            <IconButton.Icon>{props.icon}</IconButton.Icon>
          </Fragment>
        )}
    </IconButton>
  )
  return (
    <Item>
      <ShareButton icon="link" callback={copy} />
      <ShareButton icon="email" callback={email} />
      <ShareButton image={TelegramIcon} callback={telegram} />
      <ShareButton image={ViberIcon} callback={viber} />
      <ShareButton image={WhatsappIcon} callback={whatsapp} />
    </Item>
  )
}
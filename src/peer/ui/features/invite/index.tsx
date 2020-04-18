import * as clipboard from 'clipboard-polyfill';
import { h, Fragment } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../../model";
import Item from "../../item";
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
  type InviteButtonProps = {
    callback: (url: URL) => void
    disabled?: boolean
  } & ({
    image: string
    icon?: undefined
  } | {
    icon: string
    image?: undefined
  })
  const InviteButton = (props: InviteButtonProps) => props.disabled ? null : (
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
      <InviteButton icon="link" callback={copy} disabled={window['webview']}/>
      <InviteButton icon="email" callback={email} />
      <InviteButton image={TelegramIcon} callback={telegram} />
      <InviteButton image={ViberIcon} callback={viber} />
      <InviteButton image={WhatsappIcon} callback={whatsapp} />
    </Item>
  )
}
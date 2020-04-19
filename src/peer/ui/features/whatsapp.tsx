import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../model";
import { wrap } from "../util";

import Icon from './whatsapp.png'

function whatsapp(url: URL) {
  window.open(`https://wa.me/15551234567?text=${encodeURI(url.toString())}`)
}

export default ({ network }: { network: Network }) => (
  <IconButton onClick={() => network.invite(url => whatsapp(wrap(url)))}>
    <img src={Icon} style={{height: "100%"}} />
  </IconButton>
)

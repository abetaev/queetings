import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../model";
import { wrap } from "../util";
import Icon from './telegram.png';

function telegram(url: URL) {
  window.open(`https://telegram.me/share/url?url=${encodeURI(url.toString())}`)
}

export default ({ network }: { network: Network }) => (
  <IconButton onClick={() => network.invite(url => telegram(wrap(url)))}>
    <img src={Icon} style={{ height: "100%" }} />
  </IconButton>
)
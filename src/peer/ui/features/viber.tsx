import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../model";
import { wrap } from "../util";
import Icon from './viber.png';

function viber(url: URL) {
  window.open(`viber://pa?chatURI=&text=${url.toString()}`)
}

export default ({ network }: { network: Network }) => (
  <IconButton onClick={() => network.invite(url => viber(wrap(url)))}>
    <img src={Icon} style={{
        height: "29px",
        width: "29px",
        position: "absolute",
        top: "10px",
        left: "10px"
    }} />
  </IconButton>
)

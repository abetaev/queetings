import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../model";
import { wrap } from "../util";

function email(url: URL) {
  window.open(`mailto:?body=${encodeURI(url.toString())}`)
}

export default ({ network }: { network: Network }) => (
  <IconButton onClick={() => network.invite(url => email(wrap(url)))}>
    <IconButton.Icon on>email</IconButton.Icon>
    <IconButton.Icon>email</IconButton.Icon>
  </IconButton>
)
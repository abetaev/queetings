import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../../model";
import { wrap } from "../util";

import * as clipboard from 'clipboard-polyfill'

export async function copy(url: URL) {
  try {
    await clipboard.writeText(url.toString())
    alert('link copied to clipboard')
  } catch (error) {
    alert(`failed to copy link: ${error}`)
  }
}

export default ({ network }: { network: Network }) => window['webview'] ? null : (
  <IconButton onClick={() => network.invite(url => copy(wrap(url)))}>
    <IconButton.Icon on>link</IconButton.Icon>
    <IconButton.Icon>link</IconButton.Icon>
  </IconButton>
)
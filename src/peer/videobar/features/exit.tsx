import { h } from 'preact';
import IconButton from "preact-material-components/ts/IconButton";
import { Network } from "../model";
import Item from '../item';

export default ({ network }: { network: Network }) => (
  <Item>
    <IconButton onClick={() => network.quit()}>
      <IconButton.Icon on>exit_to_app</IconButton.Icon>
      <IconButton.Icon>exit_to_app</IconButton.Icon>
    </IconButton>
  </Item>
)
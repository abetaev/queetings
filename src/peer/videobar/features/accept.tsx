import { h } from 'preact';
import TextField, { TextFieldInput } from 'preact-material-components/ts/TextField';
import { Network } from "../model";
import Item from '../item';

export default ({ network }: { network: Network }) => window['webview'] ? null : (
  <Item>
    <TextField type="url" leadingIcon="link" dense outlined
      onChange={({ target }) => {
        try {
          const url = new URL(target.value)
          const invitation = url.protocol === 'https' ? new URL(url.searchParams.get('join')) : target.value
          network.join(invitation)
        } finally {
          target.value = ""
        }
      }} >
      <TextFieldInput />
    </TextField>
  </Item>
)
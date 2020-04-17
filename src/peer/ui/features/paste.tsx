import { h } from 'preact';
import TextField, { TextFieldInput } from 'preact-material-components/ts/TextField';
import { Network } from "../../model";

export default ({ network }: { network: Network }) => window['webview'] ? null : (
  <TextField type="url" leadingIcon="link" dense outlined
    outerStyle={{
      maxHeight: "2.2em",
      margin: "0",
      padding: "0",
      border: "none"
    }}
    onChange={({ target }) => {
      try {
        const url = new URL(target.value)
        const invitation = url.protocol === 'wss' ? target.value : url.searchParams.get('join')
        network.accept(invitation)
      } finally {
        target.value = ""
      }
    }} >
    <TextFieldInput/>
  </TextField>
)
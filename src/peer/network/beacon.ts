export type SignallingConnection = {
  receiveMessage: (receiver: (event: MessageEvent) => Promise<void>) => void,
  sendMessage: (message: any) => void
}

export async function issueInvite(beaconServer: URL):
  Promise<{
    dialogHandler: SignallingConnection,
    inviteUrl: string
  }> {

  const socket = new WebSocket(beaconServer.toString())

  const tokenPromise = new Promise<string>((resolve) => {
    socket.onmessage = async ({ data: invitation }: MessageEvent) => resolve(invitation)
  });

  const token = await tokenPromise

  return {
    dialogHandler: handler(socket),
    inviteUrl: `${beaconServer}${token}`
  }

}

export async function accept(invitation: string): Promise<SignallingConnection> {
  const socket = new WebSocket(invitation);
  await new Promise(resolve => socket.onopen = () => resolve())
  return handler(socket)
}

const handler = (socket: WebSocket): SignallingConnection => ({
  receiveMessage: (receiver) => socket.onmessage = ({ data }) => receiver(JSON.parse(data)),
  sendMessage: (message) => socket.send(JSON.stringify(message))
})
import { meet, inviteAt } from './rtc-lib'

const MONITOR_INTERVAL = 10000;
const ECHO_INTERVAL = 1000;
const HELLO_INTERVAL = 100;

export interface Network {
  id: string
  peers: string[]
}

export type Conversation = {
  id: string
  peer: RTCPeerConnection
  controlChannel: RTCDataChannel
  stream: MediaStream
  echoes: number
}

export type Conversations = { [id: string]: Conversation }

export type Meeting = {
  stream: MediaStream
  network: Network
  beaconServer: string
  conversations: { [peerId: string]: Conversation }
  on: (event: 'connect' | 'disconnect', peer: string) => void
}

export async function issueInvitation(
  meeting: Meeting,
  sendInvite: (inviteUrl: URL) => void) {

  const { beaconServer, stream } = meeting

  const { peer, init, inviteUrl } = await inviteAt(beaconServer);

  // declare own resources to share
  const conversation = defineConversation(peer, stream);

  await new Promise(
    async (resolve, reject) => {
      peer.ondatachannel = async ({ channel }) => {
        if (channel.label !== "control") {
          // principle: incompatible? fail: *fail fast*!
          channel.close()
          peer.close()
          reject(`channel "${channel.label}" is not supported`);
        }

        console.log('received control channel')
        conversation.controlChannel = channel

        channel.onopen = async () => {
          startConversation(meeting, conversation)
        }

        resolve();
      }

      sendInvite(inviteUrl);

      await init();

    }
  );

  return meeting;
}

export async function acceptInvitation(
  meeting: Meeting,
  invitation: string
) {
  const inviteUrl = new URL(invitation);

  const { peer, init } = await meet(inviteUrl);
  const { stream } = meeting

  const conversation = defineConversation(peer, stream);

  const controlChannel = peer.createDataChannel("control");
  controlChannel.onopen = () => {
    conversation.controlChannel = controlChannel;
    startConversation(meeting, conversation)
  }

  await init();
}


function defineConversation(
  peer: RTCPeerConnection,
  stream: MediaStream
): Conversation {
  const conversation: Conversation = {
    id: "",
    peer: null as RTCPeerConnection,
    controlChannel: null as RTCDataChannel,
    stream: null as MediaStream,
    echoes: 1
  }

  stream.getTracks()
    .forEach(track => peer.addTrack(track, stream))
  peer.ontrack = ({ streams: [stream] }) => {
    if (conversation.stream === null) {
      conversation.stream = stream;
    } else if (conversation.stream.id !== stream.id) {
      peer.close()
      throw new Error(`peer tries to send more than one media stream: ${stream.id}`)
    }
  }

  Object.assign(conversation, { peer })

  return conversation;
}

function startConversation(meeting: Meeting, conversation: Conversation) {
  console.log('starting conversation')
  conversation.controlChannel.onmessage =
    ({ data }) => handleControlMessage(
      meeting,
      conversation,
      JSON.parse(data)
    );
  setTimeout(() => {
    sendControlMessage(conversation, {
      type: 'hello',
      network: meeting.network
    })
  }, HELLO_INTERVAL);
}

type HelloMessage = { type: "hello", network: Network }
type JoinMessage = { type: "join", invitation: string }
type EchoMessage = { type: "echo", network: Network }
type ControlMessage = { to?: string, from?: string } & (
  HelloMessage
  | JoinMessage
  | EchoMessage
)

function sendControlMessage(conversation: Conversation, message: ControlMessage) {
  const { controlChannel } = conversation;
  controlChannel.send(JSON.stringify(message))
}

async function handleControlMessage(
  meeting: Meeting,
  conversation: Conversation,
  message: ControlMessage
) {
  const { network } = meeting
  const { to, from } = message

  if (to && to !== network.id) {
    if (from === conversation.id) {
      if (meeting.conversations[to]) {
        sendControlMessage(meeting.conversations[to], message);
      } else {
        throw new Error(`undeliverable message: ${JSON.stringify(message)}`)
      }
    }
    return;
  }

  if (message.type === "join") {
    await acceptInvitation(meeting, message.invitation)
  } else if (message.type === "hello" && conversation.id === "") {
    negotiateConnection(meeting, conversation, message.network);
    extendNetwork(meeting, conversation, message.network);
  } else if (message.type === "echo" && conversation.id !== "") {
    conversation.echoes++;
    extendNetwork(meeting, conversation, message.network);
  } else {
    disconnect(meeting, conversation.id)
    throw new Error(`unexpected message: ${JSON.stringify(message)}`)
  }

}

function negotiateConnection(meeting: Meeting, conversation: Conversation, network: Network) {
  if (!meeting.network.peers.includes(network.id)) {
    meeting.network.peers.push(network.id)
  }
  conversation.id = network.id;
  meeting.conversations[network.id] = conversation;
  conversation.peer.onconnectionstatechange = () => {
    if (conversation.peer.connectionState === "disconnected") {
      console.log(`detected connection loss with ${network.id}`)
      disconnect(meeting, network.id)
    }
  }
  scheduleEcho(meeting, conversation);
  monitor(meeting, conversation);
  meeting.on('connect', network.id)
  console.log(`connecion with ${network.id} negotiated`)
}

async function extendNetwork(meeting: Meeting, conversation: Conversation, network: Network) {
  network.peers
    .filter(peer => peer != meeting.network.id)
    .filter(peer => !meeting.network.peers.includes(peer))
    .forEach(async (newPeer) => connect(meeting, conversation, newPeer))
}

function connect(meeting: Meeting, conversation: Conversation, id: string) {
  if (meeting.network.peers.includes(id)) {
    console.log(`already connected to ${id}`)
    return;
  }
  console.log(`connecting to ${id}`)
  meeting.network.peers.push(id)
  issueInvitation(
    meeting,
    (inviteUrl) => sendControlMessage(conversation, {
      to: id,
      from: meeting.network.id,
      type: "join",
      invitation: inviteUrl.toString()
    })
  )
}

function disconnect(meeting: Meeting, peer: string) {
  if (meeting.network.peers.includes(peer)) {
    console.log(`disconnecting from ${peer}`)
    meeting.network.peers = meeting.network.peers.filter(that => that !== peer)
    try {
      disconnectConversation(meeting.conversations[peer])
    } finally {
      delete meeting.conversations[peer]
      meeting.on('disconnect', peer);
    }
  }
}

function disconnectConversation(conversation: Conversation) {
  conversation.controlChannel.close();
  conversation.peer.close();
}

function scheduleEcho(meeting: Meeting, conversation: Conversation) {
  setTimeout(() => {
    if (meeting.network.peers.includes(conversation.id)) {
      sendControlMessage(meeting.conversations[conversation.id], ({ type: 'echo', network: meeting.network }));
      scheduleEcho(meeting, conversation);
    } else {
      console.log(`peer ${conversation.id} disconnected, cancelling echo schedule`)
    }
  }, ECHO_INTERVAL)
}

async function reconnect(meeting: Meeting, id: string) {
  console.log(`reconnectting to ${id}`)
  disconnect(meeting, id)

  const routes = Object.entries(meeting.network)
    .filter(([id, peers]) => peers.includes(id))
    .map(([id]) => id)

  const route = Math.floor(Math.random() * 31) % routes.length;

  if (route >= 0) {
    connect(meeting, meeting.conversations[route], id)
  } else {
    console.log(`no route found to ${id}`)
  }
}

function monitor(meeting: Meeting, conversation: Conversation) {
  setTimeout(() => {
    if (conversation.echoes === 0) {
      console.log(`peer ${conversation.id} does not seem alive: ${conversation.echoes}`)
      reconnect(meeting, conversation.id)
    } else {
      conversation.echoes = 0
      monitor(meeting, conversation)
    }
  }, MONITOR_INTERVAL)
}

import { v4 as uuid } from 'uuid';
import { Connection, InvitationHandler, Network, NetworkEventHandler } from "../model";
import { Conversation, ConversationEvent } from "./Conversation";
import { inviteAt, meet } from "./webrtc";


export class Meeting implements Network {

  public readonly connections: { [id: string]: Connection } = {};
  public readonly id: string = uuid();

  constructor(
    public readonly stream: MediaStream,
    private readonly beaconServer: URL,
    private readonly eventHandler: NetworkEventHandler,
    readonly invitation?: URL
  ) {
    invitation && this.accept(invitation)
  }

  invite(handler: InvitationHandler) {
    inviteAt(this.beaconServer)
      .then(async ({ peer, inviteUrl, init }) => {
        this.publish(peer)
        const conversation = new Conversation(
          this, peer,
          (c, e) => this.handle(c, e)
        )
        peer.ondatachannel = ({ channel }) => {
          if (channel.label !== "control") {
            conversation.close()
          }
          conversation.start(channel)
        }
        handler(inviteUrl)
        await init()
      })
  }

  accept(invitation: URL) {
    meet(invitation).then(async ({ peer, init }) => {
      this.publish(peer)
      const controlChannel = peer.createDataChannel("control");
      const conversation = new Conversation(
        this, peer,
        (c, e) => this.handle(c, e)
      )
      controlChannel.onopen = () => { conversation.start(controlChannel) }
      await init()
    })
  }

  private publish(peer: RTCPeerConnection) {
    this.stream.getTracks()
      .forEach(track => peer.addTrack(track, this.stream))
  }

  peers(): string[] {
    return Object.keys(this.connections)
  }

  remove(conversationId: string) {
    delete this.connections[conversationId]
  }

  send(to: string, message: string) {
    const conversation = this.connections[to]
    if (conversation) {
      conversation.send(message);
    } else {
      // TODO!: decide proper reaction
      throw new Error(`undeliverable message: ${JSON.stringify(message)}`)
    }
  }

  extend(conversation: Conversation, newPeers: string[]) {
    const knownPeers = this.peers()
    newPeers.filter(id => !knownPeers.includes(id) && id !== this.id)
      .forEach(id => this.invite(
        invitation => conversation.send({
          to: id,
          type: 'join',
          invitation: invitation.toString()
        })
      ))
  }

  private handle(conversation: Conversation, event: ConversationEvent) {
    if (event.type === 'open') {
      console.log(`open: ${conversation.id}`)
      this.connections[conversation.id] = conversation
      this.eventHandler({ network: this, connectionId: conversation.id })
    } else if (event.type === 'close') {
      console.log(`close: ${conversation.id}`)
      delete this.connections[conversation.id]
      this.eventHandler({ network: this, connectionId: conversation.id })
    } else if (event.type === 'data') {
      this.eventHandler({
        connectionId: conversation.id,
        network: this,
        data: event.data
      })
    } else if (event.type === 'extend') {
      this.extend(conversation, event.peers)
    } else if (event.type === 'forward') {
      const to = event.message.to
      delete event.message.to
      event.message.from = conversation.id
      this.send(to, JSON.stringify(event.message))
    } else if (event.type === 'join') {
      console.log(`join: ${event.to}`)
      this.accept(event.invitation)
    }

  }

}

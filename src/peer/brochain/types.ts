import { Stream } from "purefi/dist/types"

interface Typed {
  type: string
}

interface Channel<T> {
  send(message: T): void
  close(): void
}

type Receiver<T> = (message: T) => void

type Connection<I, O = I> = (
  receive?: Receiver<I>
) => Channel<O>

interface OfferEvent {
  type: 'offer'
  from: string
  accept(): void
  reject(): void
}
interface AnswerEvent {
  type: 'answer'
  from: string
  confirm(): void
  decline(): void
}
interface JoinEvent {
  type: 'join'
  from: string
}
interface DropEvent {
  type: 'drop'
  from: string
}
interface MediaEvent {
  type: 'media'
  from: string
  stream: MediaStream
}
interface DataEvent {
  type: 'data'
  from: string
  name: string
  accept<I = any, O = I>(acceptor: Receiver<Connection<I, O>>): void
}

interface MediaCommand {
  type: 'media'
  stream: MediaStream
}
interface DataCommand {
  type: 'data'
  name: string
}

type Event = OfferEvent | AnswerEvent
  | JoinEvent | DropEvent
  | MediaEvent | DataEvent
type Command = MediaCommand | DataCommand
type Link = {
  id: Promise<string>,
  connector: Connection<Event, Command>
}

type Chain = (link: Link) => void;

type DataStream<T, K extends keyof T = keyof T> = { id : K, stream: Stream<T[K]>};
type Peer<T> = {
  media: Stream<MediaStream>
  data: Stream<DataStream<T>>
}

export {
  Peer, DataStream,
  Event, Command,

  Channel as Connection, Receiver, Connection as Connector,

  Link,

  Chain,

  Typed
}

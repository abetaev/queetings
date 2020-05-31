interface Typed {
  type: string
}

interface Connection<T> {
  send(message: T): void
  close(): void
}

type Receiver<T> = (message: T) => void

type Connector<I, O = I> = (
  receive?: Receiver<I>,
) => Connection<O>

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
  name: string
  accept<I = any, O = I>(acceptor: Receiver<Connector<I, O>>): void
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
type Link = Connector<Event, Command>

export {
  Event, Command,

  Connection, Receiver, Connector,

  Link,

  Typed
}

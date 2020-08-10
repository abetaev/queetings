/**
 * muxed connection over relay server
 */

import { Stream } from 'purefi/dist/types';
import rf from 'purefi'
import { IdMessage, OutputDataMessage, InputDataMessage } from '../../relay'

type DataMessage = OutputDataMessage | InputDataMessage
type Message = IdMessage | DataMessage

type StreamInfo<T> = { id: string, mode: 'answer' | 'offer', stream: Stream<T> }

const { stringify, parse } = JSON

export default <T>(url: URL, handler: (id: string) => void): {
  streams: Stream<StreamInfo<T>>,
  connect: (to: string) => void
} => {

  const socket = new WebSocket(url.toString());

  const [internal, external] = rf.duplex(rf.run<Message>())

  internal.subscribe(e => `internal: ${stringify(e)}`)
  external.subscribe(e => `external: ${stringify(e)}`)

  socket.onmessage = ({ data }) => internal.publish(parse(data))
  internal.subscribe(message => socket.send(stringify(message)))


  rf.filter(external, message => message.type === 'id' ? message : undefined, true)
    .subscribe(({ id }) => handler(id))

  const data = rf.filter(external, message => message.type === "data" ? message : undefined)

  data.subscribe(event => console.log(`data: ${stringify(event)}`))

  const dataMux = rf.mux<T, InputDataMessage, OutputDataMessage>(
    data,
    ({ from, data }) => {
      console.log(`muxin: ${from}`)
      return [from, parse(data)]
    },
    (data, to) => {
      console.log(`muxout: ${data} / ${to}`)
      return ({ type: 'data', to, data: stringify(data) })
    }
  )

  dataMux.subscribe(event => console.log(`dataMux: ${stringify(event)}}`))

  const streams = rf.map<Omit<StreamInfo<T>, "mode">, StreamInfo<T>>(

    dataMux,

    ({ id, stream }) => ({
      id,
      mode: 'answer',
      stream
    }),

    ({ id, stream }) => ({ id, stream })

  );

  return {
    streams,
    connect: (id) => {
      console.log('connecting to ' + id)
      const stream = rf.run<T>()
      stream.subscribe(event => console.log(`stream-${id}: ${JSON.stringify(event)}`))
      streams.publish({
        id,
        mode: 'offer',
        stream
      })
    }
  }

}
import { RTCSignallingConnection } from './Link';

export default class implements RTCSignallingConnection {

  private socket: WebSocket
  private ready: boolean = false

  constructor(url: URL) {
    this.socket = new WebSocket(url.toString())
    this.socket.onopen = () => {
      this.ready = true
    }
  }

  receive(receiver: (message: string) => void) {
    this.socket.onmessage = ({ data }) => receiver(data)
  }

  async send(message: string) {
    while (!this.ready) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    this.socket.send(message)
  }

  close() {
    this.socket.close()
  }

}
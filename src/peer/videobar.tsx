/**
 * entry point
 */

import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import brochain, { NetEvent, Service } from './brochain';
import { Network } from './model';
import PrivacyPolicy from './PrivacyPolicy';
import './videobar.css';
import VideoBar from './videobar/index';

const ua = navigator.userAgent
window['webview'] = window['webview'] || /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))

const documentURL = new URL(document.URL)

const net = brochain()

let service = null

function useNetwork() {
  let [network, set] = useState<Partial<Network>>({
    join: url => service.join(url),
    useInvite: () => service.useInvite(),
    hasInvite: () => service.hasInvite()
  })

  const update = (update: Partial<Network>) => {
    network = Object.assign(update, network || {}) as Network
    set(network)
  }

  if (!service) {
    service = new class implements Service {

      readonly name = 'video BAR'
      public message = null

      private invite: URL = null

      hasInvite = () => this.invite && true
      useInvite() {
        const invite = this.invite
        if (!invite) {
          throw new Error('no invite')
        }
        this.invite = null
        return invite
      }

      private async setupStreamIfNeeded() {
        if (!network.stream) {
          let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          update({ stream })
        }
      }

      async onNet(event: NetEvent, reply: (message: any) => void) {
        switch (event.type) {
          case 'invite':
            console.log(`received invite URL`)
            this.invite = event.url
          case 'call':
            update({ id: net.chain.id })
            await this.setupStreamIfNeeded()
            break;
          case 'join':
            console.log(`processing join event`)
            await this.setupStreamIfNeeded()
            net.chain.play(network.stream, event.from)
            break;
          case 'stream': {
            console.log(`received stream from ${event.from}`)
            const connections = network.connections || {}
            connections[event.from] = {
              id: event.from,
              stream: event.stream,
              close: () => { }
            }
            update({ connections })
            break
          }
          case 'tear': {
            console.log(`link ${event.from} torn`)
            const connections = network.connections || {}
            delete connections[event.from]
            update({ connections })
            break;
          }
        }
      }
      public join(url?: URL) {
        const joinURL = url || new URL(`wss://${documentURL.host}/`)
        console.log(`joining: ${joinURL}`)
        net.chain.join(joinURL)
        if (joinURL === this.invite) {
          this.invite = null
        }
      }
      public quit() {
        net.chain.quit()
      }
    }
    net.attach(service)
  }

  return network
}

let url = documentURL.searchParams.get('join')
const Network = () => {
  const network = useNetwork()
  if (network.stream) {
    window['network'] = network
    return <VideoBar network={network as Network} />
  } else {
    return <button class="enter" onClick={() => setTimeout(() => {
      network.join(url && new URL(url))
      url = undefined
    }, 500)}>enter BAR</button>
  }
}

const View = () => (
  new URL(document.URL).searchParams.get("privacy") !== null ? (
    <PrivacyPolicy />
  ) : (
      <Network />
    )
)

document.title = "video BAR"
setTimeout(() => render(
  <View />,
  document.body
), 500)

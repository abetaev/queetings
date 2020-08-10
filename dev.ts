import { ChildProcess, execSync, spawn } from "child_process"
import watch from 'node-watch'

process.env.DEV = '1'

let peerUpdated = true
let relayUpdated = true

function log(message: any) {
  if (typeof message === 'string') {
    console.log(new Date(), message)
  } else {
    console.error(new Date(), decoder.decode(message))
  }
}

function runEvery(operation: () => void | Promise<void>, interval: number) {
  setTimeout(async () => {
    await operation();
    runEvery(operation, interval)
  }, interval)
}

const decoder = new TextDecoder();


const startRelay = () => {
  log('building relay...')
  log(execSync("npm run build-relay"))
  log('starting relay')
  return spawn('node', ['relay'])
}
let relay: ChildProcess;

runEvery(async () => {
  const updateRequired = peerUpdated || relayUpdated
  if (peerUpdated) {
    peerUpdated = false;
    try {
      log('updating peer...')
      const output = execSync("npm run build-peer");
      log(decoder.decode(output))
    } catch (error) {
      log(`peer update failed: ${error.toString()}`)
    }
  }
  if (relayUpdated) {
    relayUpdated = false;
    try {
      if (relay) {
        log('stopping relay...')
        relay.kill()
      }
      log('starting relay...')
      relay = startRelay()
      relay.stdout.on('data', log)
    } catch (error) {
      // TODO: handle errors properly
      log('relay restart failed:')
      log(error)
    }
  }
  updateRequired && log(`peer&relay are up to date: https://localhost:8082/`)
}, 100)

watch('src', { recursive: true },
  (_, file: string) => {
    const relativeFile = file.substr('src/'.length)
    if (relativeFile.startsWith('relay')) {
      relayUpdated = true
    } else if (relativeFile.startsWith('peer')) {
      peerUpdated = true
    } else {
      log(`wrong file ${file}!`)
    }
  }
)
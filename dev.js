process.env.DEV = '1'

let peerUpdated = true
let beaconUpdated = true

function log(message) {
  if (typeof message === 'string') {
    console.log(new Date(), message)
  } else {
    console.error(new Date(), decoder.decode(message))
  }
}

function runEvery(operation, interval) {
  setTimeout(async () => {
    await operation();
    runEvery(operation, interval)
  }, interval)
}

const decoder = new TextDecoder();

const { spawn, execSync } = require('child_process')

const startBeacon = () => {
  log('building beacon...')
  log(execSync("npm run build-beacon"))
  log('starting beacon')
  return spawn('npm', ['start'])
}
let beacon;

runEvery(async () => {
  const updateRequired = peerUpdated || beaconUpdated
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
  if (beaconUpdated) {
    beaconUpdated = false;
    try {
      if (beacon) {
        log('stopping beacon...')
        log(execSync("npm stop"))
      }
      log('starting beacon...')
      beacon = startBeacon()
      beacon.stdout.on('data', log)
    } catch (error) {
      log('beacon restart failed:')
      log(error)
    }
  }
  updateRequired && log(`peer&beacon are up to date: https://localhost:8082/`)
}, 100)

const watch = require('node-watch')
watch('src', { recursive: true },
  (_, file) => {
    const relativeFile = file.substr('src/'.length)
    if (relativeFile.startsWith('beacon')) {
      beaconUpdated = true
    } else if (relativeFile.startsWith('peer')) {
      peerUpdated = true
    } else {
      log(`wrong file ${file}!`)
    }
  }
)
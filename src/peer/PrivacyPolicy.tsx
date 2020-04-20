import { h } from 'preact'

const bifi="bifi"
const dok="do"
const gmailCom="gmail.c"

export default () => (
  <div>
    <h1>Privacy Policy</h1>
    <p>All data captured by camera and microphone is intended
      to be sent *directly* and only to those users who are
      connected to a room.</p>

    <p>There is no TURN server, so it may fail to communicate
      in some rare cases. Server is used only to host content
      and provide signalling connections.</p>

    <a href={`mailto:${bifi}${dok}k@${gmailCom}om`}>@wishes and complaints</a>
  </div>
)
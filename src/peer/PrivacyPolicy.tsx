import { h, Fragment } from 'preact'

const bifi="bifi"
const dok="do"
const gmailCom="gmail.c"

export default () => (
  <div>
    <h1>Privacy Policy</h1>
    <p>Since this application uses webcamera and microphone
     it is required to provide a privacy policy statement
     which declares intent of such usage.</p>

    <h2>Why <b>video BAR</b> is using camera and microphone?</h2>

    <p>This application uses peer to peer communication based
      on WebRTC technology. All audio and video data goes only
      directly between users and each user has full control
      over what he or she is sharing at the moment. Image from
      camera is always displayed. If not - it's a bug!
      User always sees the same image which is transmitted to others.</p>

    <p>There is no TURN server, so it may fail to communicate
      in some rare cases. Server is used only to host content
      and provide signalling connections.</p>

    <p>we take no responsibility! ;-)</p>

    <a href={`mailto:${bifi}${dok}k@${gmailCom}om`}>@complaints and other stuff...</a>
  </div>
)
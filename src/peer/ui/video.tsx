import { h, JSX, VNode } from 'preact'
import NoImage from './assets/novideo_white.png'

type VideoProps = {
  stream?: MediaStream,
  controls?: VNode | VNode[],
  ref?: (ref: HTMLVideoElement) => void
} & JSX.HTMLAttributes<HTMLVideoElement>
export const Video = ({ stream, controls, ref, ...props }: VideoProps) => {
  let videoElement = null
  return (
    <video
      autoPlay
      poster={NoImage}
      ref={video => {
        if (video && stream) {
          videoElement = video
          video.srcObject = stream;
          video.load();
          ref && ref(video)
        }
      }}
      {...props} />
  )
}

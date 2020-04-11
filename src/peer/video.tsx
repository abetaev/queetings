import { h, JSX, VNode } from 'preact'
import NoImage from './assets/novideo.png'

type VideoProps = {
  stream?: MediaStream,
  controls?: VNode | VNode[],
  ref?: (ref: HTMLVideoElement) => void
} & JSX.HTMLAttributes<HTMLVideoElement>
export const Video = ({ stream, controls, ref, ...props }: VideoProps) => (
  <video
    autoPlay
    poster={NoImage}
    ref={video => {
      if (video && stream) {
        video.srcObject = stream;
        video.load();
        ref && ref(video)
      }
    }}
    {...props} />
)
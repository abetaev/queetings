import { h, JSX, VNode } from 'preact'
import NoImage from './assets/novideo.png'


type VideoProps = {
  stream?: MediaStream,
  controls?: VNode | VNode[],
  ref?: (ref: HTMLVideoElement) => void
} & JSX.HTMLAttributes<HTMLVideoElement>
export const Video = ({ stream, controls, ref, ...props }: VideoProps) => (
  <div>
    {controls && controls || null}
    <video
      autoPlay
      poster={NoImage}
      style={{
        width: '100%',
        maxHeight: '100%'
      }}
      ref={video => {
        if (video && stream) {
          video.srcObject = stream;
          video.load();
          ref && ref(video)
        }
      }}
      {...props} />
  </div>
)
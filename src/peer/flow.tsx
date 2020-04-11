/**
 * this is layout of all the tiles
 * responsibility for ordering is on tiles provider
 */

import { h, VNode } from "preact";
import { useState } from "preact/hooks";
import { px } from "./css";
import './flow.css'

function* range(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

export default ({ tail: tiles, head: menu }: { tail: VNode[], head: VNode }) => {
  const [size, setSize] = useState<{ width: number, height: number }>({ width: window.innerWidth, height: window.innerHeight })
  window.onresize = () => setSize({ width: window.innerWidth, height: window.innerHeight })

  const orientation = 3 * size.width > 4 * size.height ? 'landscape' : 'portrait'
  const nItems = tiles.length + 1

  let hItems: number
  let vItems: number

  switch (orientation) {
    case 'landscape':
      hItems = Math.ceil(Math.sqrt(nItems))
      vItems = Math.ceil(nItems / hItems)
      break;
    case 'portrait':
      vItems = Math.ceil(Math.sqrt(nItems))
      hItems = Math.ceil(nItems / vItems)
      break;
  }

  const vSize = px(size.height / vItems);
  const hSize = px(size.width / hItems);
  const emptyTiles = [...range(2, (hItems * vItems) - tiles.length)]
  return (
    <main style={{
      gridTemplateColumns: `repeat(auto-fit, minmax(${hSize}, 1fr))`,
      gridTemplateRows: `repeat(auto-fit, minmax(${vSize}, 1fr))`
    }}>
      {tiles.map(tile => <div style={{ position: 'relative', maxWidth: hSize, maxHeight: vSize }}>{tile}</div>)}
      {emptyTiles.map(() => <div />)}
      <div style={{ position: 'relative', maxHeight: vSize }}>{menu}</div>
    </main>
  )
}
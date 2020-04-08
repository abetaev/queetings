/**
 * this is layout of all the tiles
 * responsibility for ordering is on tiles provider
 */

import { h, VNode } from "preact"
import { pc, px } from "./css";
import { useState } from "preact/hooks";

function* range(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

export default ({ tiles, menu }: { tiles: VNode[], menu: VNode }) => {
  const [size, setSize] = useState<{width: number, height: number}>({width: window.innerWidth, height: window.innerHeight})
  window.onresize = () => setSize({width: window.innerWidth, height: window.innerHeight})

  const nItems = tiles.length + 1
  const hItems = Math.ceil(Math.sqrt(nItems))
  const vItems = Math.ceil(nItems / hItems)

  const vSize = px(size.height / vItems);
  const hSize = px(size.width / hItems);
  const emptyTiles = [...range(2, (hItems * vItems) - tiles.length)]
  return (
    <main style={{
      gridTemplateColumns: `repeat(auto-fit, minmax(${hSize}, 1fr))`,
      gridTemplateRows: `repeat(auto-fit, minmax(${vSize}, 1fr))`
    }}>
      {tiles.map(tile => <div style={{ maxWidth: hSize, maxHeight: vSize }}>{tile}</div>)}
      {emptyTiles.map(() => <div />)}
      <div style={{position: 'relative', maxHeight: vSize}}>{menu}</div>
    </main>
  )
}
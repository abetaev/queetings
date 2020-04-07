/**
 * this is layout of all the tiles
 * responsibility for ordering is on provider
 */

import { h, VNode } from "preact"

export default ({ tiles }: { tiles: VNode[] }) => {
  return (
    <main>
      {tiles}
    </main>
  )
}
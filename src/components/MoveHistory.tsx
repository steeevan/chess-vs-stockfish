import { useEffect, useRef } from 'react'
import type { MoveRecord } from '../engine/types'

type Props = {
  moves: MoveRecord[]
}

export function MoveHistory({ moves }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves.length])

  // Group into pairs: [white, black]
  const pairs: [MoveRecord, MoveRecord | null][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null])
  }

  return (
    <div className="move-history">
      <h3 className="panel-title">Move History</h3>
      <div className="move-list">
        {pairs.length === 0 && (
          <p className="move-empty">No moves yet</p>
        )}
        {pairs.map(([white, black], i) => (
          <div key={i} className="move-pair">
            <span className="move-number">{white.moveNumber}.</span>
            <span className="move-san move-white">{white.san}</span>
            {black && <span className="move-san move-black">{black.san}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

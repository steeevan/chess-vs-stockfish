import type { Color, PieceSymbol } from '../engine/types'
import { PIECE_UNICODE } from '../engine/types'

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n']

type Props = {
  color: Color
  onSelect: (piece: PieceSymbol) => void
}

export function PromotionModal({ color, onSelect }: Props) {
  return (
    <div className="promotion-overlay">
      <div className="promotion-modal">
        <p className="promotion-title">Promote pawn to:</p>
        <div className="promotion-choices">
          {PROMOTION_PIECES.map((p) => (
            <button
              key={p}
              className="promotion-btn"
              onClick={() => onSelect(p)}
              title={p}
            >
              {PIECE_UNICODE[color][p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

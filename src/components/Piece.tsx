import type { Color, PieceSymbol } from '../engine/types'

type Props = { type: PieceSymbol; color: Color }

const NAMES: Record<PieceSymbol, string> = {
  k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn',
}

export function Piece({ type, color }: Props) {
  return (
    <img
      className="piece"
      src={`/pieces/${color}${type}.svg`}
      alt={`${color === 'w' ? 'red' : 'blue'} ${NAMES[type]}`}
      draggable={false}
    />
  )
}

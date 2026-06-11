import type { Square as SquareType, IdedPiece, Color } from '../engine/types'
import { FILE_LABELS, RANK_LABELS } from '../engine/types'
import { Square } from './Square'
import { Piece } from './Piece'

type Props = {
  pieces: IdedPiece[]
  selectedSquare: SquareType | null
  legalTargets: SquareType[]
  lastMove: { from: SquareType; to: SquareType } | null
  checkSquare: SquareType | null
  orientation: Color
  onSquareClick: (square: SquareType) => void
}

function squareToColRow(square: SquareType, orientation: Color): { col: number; row: number } {
  const fileIndex = FILE_LABELS.indexOf(square[0] as (typeof FILE_LABELS)[number])
  const rankNum = Number(square[1])
  if (orientation === 'w') {
    return { col: fileIndex, row: 8 - rankNum }
  }
  return { col: 7 - fileIndex, row: rankNum - 1 }
}

export function Board({
  pieces,
  selectedSquare,
  legalTargets,
  lastMove,
  checkSquare,
  orientation,
  onSquareClick,
}: Props) {
  const ranks = orientation === 'w' ? RANK_LABELS : [...RANK_LABELS].reverse()
  const files = orientation === 'w' ? FILE_LABELS : [...FILE_LABELS].reverse()

  // Stable sort by id so React never reorders DOM nodes (keeps transitions intact)
  const sortedPieces = [...pieces].sort((a, b) => a.id - b.id)

  return (
    <div className="board-frame">
      <div className="board-area">
        <div className="board-grid">
          {ranks.map((rank, ri) =>
            files.map((file, fi) => {
              const sq = `${file}${rank}` as SquareType
              const isLight = (ri + fi) % 2 === 0
              return (
                <Square
                  key={sq}
                  square={sq}
                  hasPiece={pieces.some((p) => p.square === sq)}
                  isLight={isLight}
                  isSelected={selectedSquare === sq}
                  isLegalTarget={legalTargets.includes(sq)}
                  isLastMove={lastMove?.from === sq || lastMove?.to === sq}
                  isInCheck={checkSquare === sq}
                  rankLabel={fi === 0 ? rank : null}
                  fileLabel={ri === 7 ? file : null}
                  onClick={onSquareClick}
                />
              )
            }),
          )}
        </div>

        {/* Animated piece layer — transforms transition between squares */}
        <div className="piece-layer">
          {sortedPieces.map((p) => {
            const { col, row } = squareToColRow(p.square, orientation)
            return (
              <div
                key={p.id}
                className="anim-piece"
                style={{ transform: `translate(${col * 100}%, ${row * 100}%)` }}
              >
                <Piece type={p.type} color={p.color} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

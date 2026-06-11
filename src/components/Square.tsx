import type { Square as SquareType } from '../engine/types'

type Props = {
  square: SquareType
  hasPiece: boolean
  isLight: boolean
  isSelected: boolean
  isLegalTarget: boolean
  isLastMove: boolean
  isInCheck: boolean
  rankLabel: string | null
  fileLabel: string | null
  onClick: (square: SquareType) => void
}

export function Square({
  square,
  hasPiece,
  isLight,
  isSelected,
  isLegalTarget,
  isLastMove,
  isInCheck,
  rankLabel,
  fileLabel,
  onClick,
}: Props) {
  const classes = [
    'square',
    isLight ? 'square-light' : 'square-dark',
    isSelected ? 'square-selected' : '',
    isLastMove ? 'square-last-move' : '',
    isInCheck ? 'square-check' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} onClick={() => onClick(square)} data-square={square}>
      {rankLabel && <span className="coord coord-rank">{rankLabel}</span>}
      {fileLabel && <span className="coord coord-file">{fileLabel}</span>}
      {isLegalTarget && (
        <div className={`move-dot ${hasPiece ? 'move-dot-capture' : ''}`} />
      )}
    </div>
  )
}

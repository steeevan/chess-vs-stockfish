import type { GameStatus, Color } from '../engine/types'

type Props = {
  status: GameStatus
  turn: Color
  playerColor: Color
  onNewGame: () => void
  onClose: () => void
}

export function GameOverModal({ status, turn, playerColor, onNewGame, onClose }: Props) {
  const isDraw = status === 'stalemate' || status === 'draw'
  const isWin = !isDraw && turn !== playerColor

  const title = isDraw ? 'Draw' : isWin ? 'Victory!' : 'Defeat'
  const icon = isDraw ? '🤝' : isWin ? '🏆' : '🏳️'
  const reason =
    status === 'checkmate' ? 'by checkmate'
    : status === 'timeout' ? 'on time'
    : status === 'stalemate' ? 'by stalemate'
    : 'drawn game'

  const subtitle = isDraw
    ? `Game drawn ${status === 'stalemate' ? 'by stalemate' : ''}`
    : isWin
      ? `You beat Stockfish ${reason}`
      : `Stockfish wins ${reason}`

  return (
    <div className="result-overlay" onClick={onClose}>
      {isWin && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => <i key={i} />)}
        </div>
      )}
      <div
        className={`result-modal ${isWin ? 'result-win' : isDraw ? 'result-draw' : 'result-lose'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="result-icon">{icon}</div>
        <h2 className="result-title">{title}</h2>
        <p className="result-subtitle">{subtitle}</p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onNewGame}>Play Again</button>
          <button className="btn btn-secondary" onClick={onClose}>View Board</button>
        </div>
      </div>
    </div>
  )
}

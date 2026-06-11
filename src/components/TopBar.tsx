import type { GameStatus as GameStatusType, Color } from '../engine/types'

type Props = {
  status: GameStatusType
  turn: Color
  isThinking: boolean
  onNewGame: () => void
  onFlipBoard: () => void
}

const STATUS_MESSAGES: Record<GameStatusType, (turn: Color) => string> = {
  playing: (turn) => `${turn === 'w' ? 'White' : 'Black'} to move`,
  check: (turn) => `${turn === 'w' ? 'White' : 'Black'} is in check`,
  checkmate: (turn) => `Checkmate — ${turn === 'w' ? 'Black' : 'White'} wins`,
  stalemate: () => 'Stalemate — Draw',
  draw: () => 'Draw',
  timeout: (turn) => `${turn === 'w' ? 'White' : 'Black'} flagged — ${turn === 'w' ? 'Black' : 'White'} wins on time`,
}

export function TopBar({ status, turn, isThinking, onNewGame, onFlipBoard }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">♞</span>
        <div className="brand-text">
          <h1 className="brand-title">Chess</h1>
          <span className="brand-sub">vs Stockfish 18</span>
        </div>
      </div>

      <div className={`topbar-status status-${status}`}>
        {isThinking ? (
          <span className="thinking-indicator">
            <span className="dot" /><span className="dot" /><span className="dot" />
            thinking
          </span>
        ) : (
          <>
            <span className={`turn-dot ${turn === 'w' ? 'turn-dot-w' : 'turn-dot-b'}`} />
            {STATUS_MESSAGES[status](turn)}
          </>
        )}
      </div>

      <div className="topbar-actions">
        <button className="btn btn-secondary" onClick={onFlipBoard}>Flip</button>
        <button className="btn btn-primary" onClick={onNewGame}>New Game</button>
      </div>
    </header>
  )
}

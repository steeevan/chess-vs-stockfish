import type { GameStatus as GameStatusType, Color, TimeControl } from '../engine/types'
import { TIME_CONTROL_OPTIONS, timeControlId } from '../engine/types'

type Props = {
  status: GameStatusType
  turn: Color
  playerColor: Color
  difficulty: number
  onDifficultyChange: (d: number) => void
  onNewGame: () => void
  timeControl: TimeControl | null
  whiteMs: number | null
  blackMs: number | null
  clockStarted: boolean
  onTimeControlChange: (tc: TimeControl | null) => void
}

function formatClock(ms: number): string {
  if (ms < 10_000) {
    return `0:0${(ms / 1000).toFixed(1)}`
  }
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function GameStatus({
  status,
  turn,
  playerColor,
  difficulty,
  onDifficultyChange,
  onNewGame,
  timeControl,
  whiteMs,
  blackMs,
  clockStarted,
  onTimeControlChange,
}: Props) {
  const isGameOver =
    status === 'checkmate' || status === 'stalemate' || status === 'draw' || status === 'timeout'

  const resultText =
    status === 'checkmate'
      ? turn === playerColor
        ? 'Stockfish wins by checkmate'
        : 'You win by checkmate!'
      : status === 'timeout'
        ? turn === playerColor
          ? 'You ran out of time'
          : 'Stockfish flagged — you win on time!'
        : 'Game drawn'

  const clockActive = (color: Color) =>
    timeControl !== null && clockStarted && !isGameOver && turn === color

  const renderClock = (ms: number | null, color: Color) => {
    if (ms === null) return null
    const classes = [
      'clock',
      clockActive(color) ? 'clock-active' : '',
      ms <= 20_000 ? 'clock-low' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return <span className={classes}>{formatClock(ms)}</span>
  }

  return (
    <div className="panel">
      <h3 className="panel-title">Players</h3>

      <div className="player-card">
        <span className="player-avatar player-avatar-b">♚</span>
        <div className="player-meta">
          <span className="player-name">{playerColor === 'b' ? 'You' : 'Stockfish'}</span>
          <span className="player-rating">
            {playerColor === 'b' ? '' : `Elo ~${difficultyToElo(difficulty)}`}
          </span>
        </div>
        {renderClock(blackMs, 'b')}
      </div>

      <div className="player-card">
        <span className="player-avatar player-avatar-w">♔</span>
        <div className="player-meta">
          <span className="player-name">{playerColor === 'w' ? 'You' : 'Stockfish'}</span>
          <span className="player-rating">
            {playerColor === 'w' ? '' : `Elo ~${difficultyToElo(difficulty)}`}
          </span>
        </div>
        {renderClock(whiteMs, 'w')}
      </div>

      <div className="time-control">
        <label className="control-label">Time control</label>
        <select
          className="time-select"
          value={timeControlId(timeControl)}
          onChange={(e) => {
            const opt = TIME_CONTROL_OPTIONS.find((o) => o.id === e.target.value)
            onTimeControlChange(opt?.tc ?? null)
          }}
        >
          {TIME_CONTROL_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="control-hint">Changing time restarts the game</p>
      </div>

      <div className="difficulty-control">
        <label className="control-label">
          Strength <strong>Elo ~{difficultyToElo(difficulty)}</strong>
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={difficulty}
          onChange={(e) => onDifficultyChange(Number(e.target.value))}
          className="difficulty-slider"
        />
        <div className="difficulty-labels">
          <span>Casual</span>
          <span>Master</span>
        </div>
      </div>

      {isGameOver && (
        <div className="game-over-banner">
          <p>{resultText}</p>
          <button className="btn btn-primary" onClick={onNewGame}>Play Again</button>
        </div>
      )}
    </div>
  )
}

function difficultyToElo(d: number): number {
  return Math.round(400 + (d - 1) * (2400 / 19))
}

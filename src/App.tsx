import { useState, useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { Board } from './components/Board'
import { GameStatus } from './components/GameStatus'
import { MoveHistory } from './components/MoveHistory'
import { PromotionModal } from './components/PromotionModal'
import { GameOverModal } from './components/GameOverModal'
import { useChessGame } from './hooks/useChessGame'
import type { BoardTheme } from './engine/types'
import { BOARD_THEMES } from './engine/types'
import './App.css'

function loadTheme(): BoardTheme {
  const saved = localStorage.getItem('boardTheme')
  return BOARD_THEMES.some((t) => t.id === saved) ? (saved as BoardTheme) : 'walnut'
}

export default function App() {
  const {
    pieces,
    selectedSquare,
    legalTargets,
    lastMove,
    checkSquare,
    status,
    turn,
    moveHistory,
    isThinking,
    pendingPromotion,
    orientation,
    playerColor,
    difficulty,
    timeControl,
    whiteMs,
    blackMs,
    clockStarted,
    handleSquareClick,
    handlePromotion,
    newGame,
    flipBoard,
    setDifficulty,
    setTimeControl,
  } = useChessGame()

  const [boardTheme, setBoardTheme] = useState<BoardTheme>(loadTheme)
  useEffect(() => {
    localStorage.setItem('boardTheme', boardTheme)
  }, [boardTheme])

  // Result popup: appears shortly after the game ends so the final move lands first
  const isOver =
    status === 'checkmate' || status === 'stalemate' || status === 'draw' || status === 'timeout'
  const [showResult, setShowResult] = useState(false)
  useEffect(() => {
    if (!isOver) {
      setShowResult(false)
      return
    }
    const t = window.setTimeout(() => setShowResult(true), 700)
    return () => window.clearTimeout(t)
  }, [isOver])

  return (
    <div className="app">
      <TopBar
        status={status}
        turn={turn}
        isThinking={isThinking}
        onNewGame={newGame}
        onFlipBoard={flipBoard}
      />

      <main className="main">
        <div className="board-container">
          <Board
            pieces={pieces}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            lastMove={lastMove}
            checkSquare={checkSquare}
            orientation={orientation}
            theme={boardTheme}
            onSquareClick={handleSquareClick}
          />
        </div>

        <aside className="sidebar">
          <GameStatus
            status={status}
            turn={turn}
            playerColor={playerColor}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onNewGame={newGame}
            timeControl={timeControl}
            whiteMs={whiteMs}
            blackMs={blackMs}
            clockStarted={clockStarted}
            onTimeControlChange={setTimeControl}
            boardTheme={boardTheme}
            onBoardThemeChange={setBoardTheme}
          />
          <MoveHistory moves={moveHistory} />
        </aside>
      </main>

      {pendingPromotion && (
        <PromotionModal color={playerColor} onSelect={handlePromotion} />
      )}

      {showResult && (
        <GameOverModal
          status={status}
          turn={turn}
          playerColor={playerColor}
          onNewGame={newGame}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  )
}

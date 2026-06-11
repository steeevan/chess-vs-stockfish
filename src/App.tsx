import { TopBar } from './components/TopBar'
import { Board } from './components/Board'
import { GameStatus } from './components/GameStatus'
import { MoveHistory } from './components/MoveHistory'
import { PromotionModal } from './components/PromotionModal'
import { useChessGame } from './hooks/useChessGame'
import './App.css'

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
          />
          <MoveHistory moves={moveHistory} />
        </aside>
      </main>

      {pendingPromotion && (
        <PromotionModal color={playerColor} onSelect={handlePromotion} />
      )}
    </div>
  )
}

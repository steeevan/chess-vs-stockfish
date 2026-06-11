import { useState, useCallback, useRef, useEffect } from 'react'
import { Chess, type Move } from 'chess.js'
import type {
  Square, Color, PieceSymbol, IdedPiece, GameStatus, MoveRecord, TimeControl,
} from '../engine/types'
import {
  getBoardPieces,
  getLegalMovesFrom,
  getGameStatus,
  buildMoveHistory,
  isPromotionMove,
  makeMove,
  getFen,
  getTurn,
  isGameOver,
} from '../engine/gameEngine'
import { useStockfish } from './useStockfish'
import { useChessSound } from './useChessSound'

type PendingPromotion = { from: Square; to: Square }

type ChessGameState = {
  pieces: IdedPiece[]
  selectedSquare: Square | null
  legalTargets: Square[]
  lastMove: { from: Square; to: Square } | null
  checkSquare: Square | null
  status: GameStatus
  turn: Color
  moveHistory: MoveRecord[]
  isThinking: boolean
  pendingPromotion: PendingPromotion | null
  orientation: Color
  playerColor: Color
  difficulty: number
  timeControl: TimeControl | null
  whiteMs: number | null
  blackMs: number | null
}

/** Delay before the AI's move lands, so it feels like a real opponent */
const AI_MIN_DELAY_MS = 500
const AI_RANDOM_DELAY_MS = 700

const DEFAULT_TIME_CONTROL: TimeControl = { baseMin: 10, incSec: 0 }

const OVER_STATUSES: GameStatus[] = ['checkmate', 'stalemate', 'draw', 'timeout']

export function useChessGame() {
  const gameRef = useRef<Chess>(new Chess())
  const pieceIdsRef = useRef<Map<Square, number>>(new Map())
  const nextIdRef = useRef(1)
  const aiTimerRef = useRef<number | null>(null)

  function seedPieceIds(game: Chess) {
    const ids = new Map<Square, number>()
    for (const p of getBoardPieces(game)) {
      ids.set(p.square, nextIdRef.current++)
    }
    pieceIdsRef.current = ids
  }

  /** Carry piece identities across a move so the UI can animate them */
  function applyMoveToIds(move: Move) {
    const ids = pieceIdsRef.current

    if (move.isEnPassant()) {
      const capturedSq = `${move.to[0]}${move.from[1]}` as Square
      ids.delete(capturedSq)
    }

    const movedId = ids.get(move.from as Square)
    ids.delete(move.from as Square)
    if (movedId !== undefined) ids.set(move.to as Square, movedId)

    const rank = move.from[1]
    if (move.isKingsideCastle()) {
      const rookId = ids.get(`h${rank}` as Square)
      ids.delete(`h${rank}` as Square)
      if (rookId !== undefined) ids.set(`f${rank}` as Square, rookId)
    } else if (move.isQueensideCastle()) {
      const rookId = ids.get(`a${rank}` as Square)
      ids.delete(`a${rank}` as Square)
      if (rookId !== undefined) ids.set(`d${rank}` as Square, rookId)
    }
  }

  function getIdedPieces(game: Chess): IdedPiece[] {
    const ids = pieceIdsRef.current
    return getBoardPieces(game).map((p) => ({
      ...p,
      id: ids.get(p.square) ?? nextIdRef.current++,
    }))
  }

  function freshState(prefs: Partial<ChessGameState> = {}): ChessGameState {
    const tc = prefs.timeControl !== undefined ? prefs.timeControl : DEFAULT_TIME_CONTROL
    const baseMs = tc ? tc.baseMin * 60_000 : null
    return {
      pieces: getIdedPieces(gameRef.current),
      selectedSquare: null,
      legalTargets: [],
      lastMove: null,
      checkSquare: null,
      status: 'playing',
      turn: 'w',
      moveHistory: [],
      isThinking: false,
      pendingPromotion: null,
      orientation: 'w',
      playerColor: 'w',
      difficulty: 10,
      ...prefs,
      timeControl: tc,
      whiteMs: baseMs,
      blackMs: baseMs,
    }
  }

  const [state, setState] = useState<ChessGameState>(() => {
    seedPieceIds(gameRef.current)
    return freshState()
  })
  const { getBestMove, stop } = useStockfish()
  const { play } = useChessSound()

  const isOver = OVER_STATUSES.includes(state.status)
  const clockStarted = state.moveHistory.length > 0

  function clearAiTimer() {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
  }

  useEffect(() => clearAiTimer, [])

  /* ── Clock ticking ─────────────────────────────────────── */
  useEffect(() => {
    if (!state.timeControl || !clockStarted || isOver) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const delta = now - last
      last = now
      setState((prev) => {
        if (prev.turn === 'w') {
          return { ...prev, whiteMs: Math.max(0, (prev.whiteMs ?? 0) - delta) }
        }
        return { ...prev, blackMs: Math.max(0, (prev.blackMs ?? 0) - delta) }
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [state.timeControl, clockStarted, isOver])

  /* ── Flag detection (clock hit zero) ───────────────────── */
  useEffect(() => {
    if (!state.timeControl || isOver) return
    const flagged: Color | null =
      state.whiteMs !== null && state.whiteMs <= 0 ? 'w'
      : state.blackMs !== null && state.blackMs <= 0 ? 'b'
      : null
    if (!flagged) return

    stop()
    clearAiTimer()
    play('gameover')
    // turn = the flagged side, so "turn loses" status messages work
    setState((prev) => ({
      ...prev,
      status: 'timeout',
      turn: flagged,
      isThinking: false,
      selectedSquare: null,
      legalTargets: [],
      pendingPromotion: null,
    }))
  }, [state.whiteMs, state.blackMs, state.timeControl, isOver, stop, play])

  function pickSound(game: Chess, move: Move) {
    const status = getGameStatus(game)
    if (status === 'checkmate' || status === 'stalemate' || status === 'draw') {
      play('gameover')
    } else if (status === 'check') {
      play('check')
    } else if (move.san.includes('O-O')) {
      play('castle')
    } else if (move.san.includes('x')) {
      play('capture')
    } else {
      play('move')
    }
  }

  /** Add increment to the side that just moved */
  function applyIncrement(moverColor: Color) {
    setState((prev) => {
      if (!prev.timeControl || prev.timeControl.incSec <= 0) return prev
      const inc = prev.timeControl.incSec * 1000
      return moverColor === 'w'
        ? { ...prev, whiteMs: (prev.whiteMs ?? 0) + inc }
        : { ...prev, blackMs: (prev.blackMs ?? 0) + inc }
    })
  }

  const syncState = useCallback(
    (game: Chess, extra: Partial<ChessGameState> = {}) => {
      const status = getGameStatus(game)
      const turn = getTurn(game)

      let checkSquare: Square | null = null
      if (status === 'check' || status === 'checkmate') {
        const board = game.board()
        for (const row of board) {
          for (const cell of row) {
            if (cell && cell.type === 'k' && cell.color === turn) {
              checkSquare = cell.square as Square
            }
          }
        }
      }

      setState((prev) => ({
        ...prev,
        pieces: getIdedPieces(game),
        status,
        turn,
        checkSquare,
        moveHistory: buildMoveHistory(game),
        selectedSquare: null,
        legalTargets: [],
        ...extra,
      }))
    },
    [],
  )

  const triggerStockfish = useCallback(
    (game: Chess, difficulty: number) => {
      setState((prev) => ({ ...prev, isThinking: true }))
      const requestedAt = Date.now()

      getBestMove(getFen(game), difficulty, (uciMove: string) => {
        const elapsed = Date.now() - requestedAt
        const targetDelay = AI_MIN_DELAY_MS + Math.random() * AI_RANDOM_DELAY_MS
        const wait = Math.max(0, targetDelay - elapsed)

        aiTimerRef.current = window.setTimeout(() => {
          aiTimerRef.current = null
          if (gameRef.current !== game) return

          const from = uciMove.slice(0, 2) as Square
          const to = uciMove.slice(2, 4) as Square
          const promotion = uciMove[4] as PieceSymbol | undefined
          const move = makeMove(game, from, to, promotion)
          if (move) {
            applyMoveToIds(move)
            pickSound(game, move)
            applyIncrement(move.color as Color)
          }
          syncState(game, { lastMove: { from, to }, isThinking: false })
        }, wait)
      })
    },
    [getBestMove, syncState, play],
  )

  const commitPlayerMove = useCallback(
    (game: Chess, from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      const move = makeMove(game, from, to, promotion)
      if (!move) return false
      applyMoveToIds(move)
      pickSound(game, move)
      applyIncrement(move.color as Color)
      syncState(game, { lastMove: { from, to }, pendingPromotion: null })
      if (!isGameOver(game)) triggerStockfish(game, state.difficulty)
      return true
    },
    [syncState, triggerStockfish, state.difficulty, play],
  )

  const handleSquareClick = useCallback(
    (square: Square) => {
      const game = gameRef.current
      const { selectedSquare, legalTargets, playerColor, isThinking, status } = state

      if (isThinking || isGameOver(game) || OVER_STATUSES.includes(status)) return
      if (getTurn(game) !== playerColor) return

      if (selectedSquare) {
        if (legalTargets.includes(square)) {
          if (isPromotionMove(game, selectedSquare, square)) {
            setState((prev) => ({
              ...prev,
              pendingPromotion: { from: selectedSquare, to: square },
            }))
            return
          }
          if (commitPlayerMove(game, selectedSquare, square)) return
        }

        const piece = game.get(square)
        if (piece && piece.color === playerColor) {
          const targets = getLegalMovesFrom(game, square)
          setState((prev) => ({ ...prev, selectedSquare: square, legalTargets: targets }))
          return
        }

        setState((prev) => ({ ...prev, selectedSquare: null, legalTargets: [] }))
        return
      }

      const piece = game.get(square)
      if (piece && piece.color === playerColor) {
        const targets = getLegalMovesFrom(game, square)
        setState((prev) => ({ ...prev, selectedSquare: square, legalTargets: targets }))
      }
    },
    [state, commitPlayerMove],
  )

  const handlePromotion = useCallback(
    (piece: PieceSymbol) => {
      const game = gameRef.current
      const { pendingPromotion } = state
      if (!pendingPromotion) return
      if (!commitPlayerMove(game, pendingPromotion.from, pendingPromotion.to, piece)) {
        setState((prev) => ({ ...prev, pendingPromotion: null }))
      }
    },
    [state, commitPlayerMove],
  )

  const resetGame = useCallback(
    (timeControl: TimeControl | null) => {
      stop()
      clearAiTimer()
      gameRef.current = new Chess()
      seedPieceIds(gameRef.current)
      setState((prev) =>
        freshState({
          orientation: prev.orientation,
          playerColor: prev.playerColor,
          difficulty: prev.difficulty,
          timeControl,
        }),
      )
      play('start')
    },
    [stop, play],
  )

  const newGame = useCallback(() => {
    resetGame(state.timeControl)
  }, [resetGame, state.timeControl])

  /** Changing the time control starts a fresh game with the new clocks */
  const setTimeControl = useCallback(
    (tc: TimeControl | null) => {
      resetGame(tc)
    },
    [resetGame],
  )

  const flipBoard = useCallback(() => {
    setState((prev) => ({ ...prev, orientation: prev.orientation === 'w' ? 'b' : 'w' }))
  }, [])

  const setDifficulty = useCallback((d: number) => {
    setState((prev) => ({ ...prev, difficulty: d }))
  }, [])

  return {
    ...state,
    clockStarted,
    handleSquareClick,
    handlePromotion,
    newGame,
    flipBoard,
    setDifficulty,
    setTimeControl,
  }
}

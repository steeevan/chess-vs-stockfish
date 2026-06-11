import { Chess, type Move } from 'chess.js'
import type { Square, Color, PieceSymbol, BoardPiece, GameStatus, MoveRecord } from './types'

export function createGame() {
  return new Chess()
}

export function getBoardPieces(game: Chess): BoardPiece[] {
  const pieces: BoardPiece[] = []
  const board = game.board()
  for (const row of board) {
    for (const cell of row) {
      if (cell) {
        pieces.push({ type: cell.type, color: cell.color, square: cell.square })
      }
    }
  }
  return pieces
}

export function getLegalMovesFrom(game: Chess, square: Square): Square[] {
  return game.moves({ square, verbose: true }).map((m) => m.to as Square)
}

export function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return 'checkmate'
  if (game.isStalemate()) return 'stalemate'
  if (game.isDraw()) return 'draw'
  if (game.isCheck()) return 'check'
  return 'playing'
}

export function buildMoveHistory(game: Chess): MoveRecord[] {
  const history = game.history({ verbose: true })
  const records: MoveRecord[] = []
  history.forEach((move, i) => {
    records.push({
      san: move.san,
      from: move.from as Square,
      to: move.to as Square,
      color: move.color as Color,
      moveNumber: Math.floor(i / 2) + 1,
    })
  })
  return records
}

export function isPromotionMove(
  game: Chess,
  from: Square,
  to: Square,
): boolean {
  const piece = game.get(from)
  if (!piece || piece.type !== 'p') return false
  const toRank = to[1]
  return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')
}

export function makeMove(
  game: Chess,
  from: Square,
  to: Square,
  promotion?: PieceSymbol,
): Move | null {
  try {
    return game.move({ from, to, promotion: promotion ?? 'q' })
  } catch {
    return null
  }
}

export function getFen(game: Chess): string {
  return game.fen()
}

export function getTurn(game: Chess): Color {
  return game.turn()
}

export function isGameOver(game: Chess): boolean {
  return game.isGameOver()
}

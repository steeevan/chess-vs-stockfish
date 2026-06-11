import type { Square, Color, PieceSymbol } from 'chess.js'

export type { Square, Color, PieceSymbol }

export type BoardPiece = {
  type: PieceSymbol
  color: Color
  square: Square
}

/** Piece with a stable identity that survives moves — enables slide animations */
export type IdedPiece = BoardPiece & { id: number }

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'timeout'

export type TimeControl = { baseMin: number; incSec: number }

export const TIME_CONTROL_OPTIONS: { id: string; label: string; tc: TimeControl | null }[] = [
  { id: '1+0',       label: 'Bullet 1 min',      tc: { baseMin: 1,  incSec: 0 } },
  { id: '3+0',       label: 'Blitz 3 min',       tc: { baseMin: 3,  incSec: 0 } },
  { id: '3+2',       label: 'Blitz 3 | 2',       tc: { baseMin: 3,  incSec: 2 } },
  { id: '5+0',       label: 'Blitz 5 min',       tc: { baseMin: 5,  incSec: 0 } },
  { id: '10+0',      label: 'Rapid 10 min',      tc: { baseMin: 10, incSec: 0 } },
  { id: '15+10',     label: 'Rapid 15 | 10',     tc: { baseMin: 15, incSec: 10 } },
  { id: 'unlimited', label: 'Unlimited',         tc: null },
]

export type BoardTheme = 'walnut' | 'glass' | 'forest' | 'marble' | 'graffiti' | 'ocean'

/** preview: [lightSquare, darkSquare] colors for the picker swatch */
export const BOARD_THEMES: { id: BoardTheme; label: string; preview: [string, string] }[] = [
  { id: 'walnut',   label: 'Walnut',   preview: ['#ecdab9', '#ae8a68'] },
  { id: 'glass',    label: 'Glass',    preview: ['#dce8f5', '#7da3c8'] },
  { id: 'forest',   label: 'Forest',   preview: ['#d9e3bb', '#6a8f4f'] },
  { id: 'marble',   label: 'Marble',   preview: ['#eceae5', '#858b94'] },
  { id: 'graffiti', label: 'Graffiti', preview: ['#b4b4b4', '#e91e8c'] },
  { id: 'ocean',    label: 'Ocean',    preview: ['#dee3e6', '#6d8ba0'] },
]

export function timeControlId(tc: TimeControl | null): string {
  const found = TIME_CONTROL_OPTIONS.find((o) =>
    o.tc === null ? tc === null : tc !== null && o.tc.baseMin === tc.baseMin && o.tc.incSec === tc.incSec,
  )
  return found?.id ?? 'unlimited'
}

export type GameResult = {
  winner: Color | null
  reason: 'checkmate' | 'stalemate' | 'draw' | null
}

export type MoveRecord = {
  san: string       // algebraic notation e.g. "e4", "Nf3", "O-O"
  from: Square
  to: Square
  color: Color
  moveNumber: number
}

export type PlayerColor = Color | 'both'

export const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const

export const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

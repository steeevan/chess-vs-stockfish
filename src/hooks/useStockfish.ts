import { useEffect, useRef, useCallback } from 'react'

type StockfishHook = {
  getBestMove: (fen: string, depth: number, onMove: (move: string) => void) => void
  stop: () => void
}

export function useStockfish(): StockfishHook {
  const workerRef = useRef<Worker | null>(null)
  const callbackRef = useRef<((move: string) => void) | null>(null)

  useEffect(() => {
    const worker = new Worker('/stockfish.js')
    workerRef.current = worker

    worker.postMessage('uci')
    worker.postMessage('isready')

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = e.data
      if (line.startsWith('bestmove')) {
        const parts = line.split(' ')
        const move = parts[1]
        if (move && move !== '(none)' && callbackRef.current) {
          callbackRef.current(move)
          callbackRef.current = null
        }
      }
    }

    return () => {
      worker.terminate()
    }
  }, [])

  const getBestMove = useCallback(
    (fen: string, depth: number, onMove: (move: string) => void) => {
      const worker = workerRef.current
      if (!worker) return
      callbackRef.current = onMove
      worker.postMessage('stop')
      worker.postMessage(`setoption name Skill Level value ${depth}`)
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${Math.max(5, depth)}`)
    },
    [],
  )

  const stop = useCallback(() => {
    workerRef.current?.postMessage('stop')
    callbackRef.current = null
  }, [])

  return { getBestMove, stop }
}

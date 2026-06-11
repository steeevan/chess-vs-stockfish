import { useRef, useCallback } from 'react'

export type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'gameover' | 'start'

export function useChessSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  // Utility: play a simple oscillator tone
  function playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    gain: number,
    type: OscillatorType = 'sine',
  ) {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  // Utility: white noise burst (for thud/impact)
  function playNoise(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    gain: number,
    filterFreq: number,
  ) {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = filterFreq

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(gain, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start(startTime)
    source.stop(startTime + duration)
  }

  const play = useCallback((sound: SoundType) => {
    try {
      const ctx = getCtx()
      const now = ctx.currentTime

      switch (sound) {
        case 'move': {
          // Soft wooden thud: low noise burst + subtle tone
          playNoise(ctx, now, 0.06, 0.18, 800)
          playTone(ctx, 420, now, 0.05, 0.06, 'triangle')
          break
        }

        case 'capture': {
          // Heavier impact: louder noise + two-layer thud
          playNoise(ctx, now, 0.1, 0.35, 500)
          playTone(ctx, 220, now, 0.08, 0.12, 'triangle')
          playTone(ctx, 140, now + 0.02, 0.1, 0.08, 'sine')
          break
        }

        case 'castle': {
          // Two light clicks in sequence
          playNoise(ctx, now, 0.05, 0.15, 900)
          playTone(ctx, 480, now, 0.04, 0.05, 'triangle')
          playNoise(ctx, now + 0.12, 0.05, 0.15, 900)
          playTone(ctx, 480, now + 0.12, 0.04, 0.05, 'triangle')
          break
        }

        case 'check': {
          // Alert: ascending two-tone
          playTone(ctx, 660, now, 0.12, 0.2, 'sine')
          playTone(ctx, 880, now + 0.12, 0.15, 0.18, 'sine')
          playNoise(ctx, now, 0.05, 0.08, 1200)
          break
        }

        case 'start': {
          // Soft rising chime
          const melody = [523, 659, 784]
          melody.forEach((freq, i) => {
            playTone(ctx, freq, now + i * 0.15, 0.3, 0.12, 'sine')
          })
          break
        }

        case 'gameover': {
          // Descending chord (checkmate feel)
          const notes = [784, 659, 523, 392]
          notes.forEach((freq, i) => {
            playTone(ctx, freq, now + i * 0.22, 0.6, 0.15, 'sine')
            playTone(ctx, freq * 0.5, now + i * 0.22, 0.6, 0.08, 'triangle')
          })
          break
        }
      }
    } catch {
      // AudioContext may be blocked before user interaction — fail silently
    }
  }, [])

  return { play }
}

import { ui } from './ui.svelte.ts'

export function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

type KeyMap = Record<string, (e: KeyboardEvent) => void>

// Stack for stopAll handlers — last registered wins (highest priority)
const stopAllStack: KeyMap[] = []

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (stopAllStack.length === 0) return
  ui.keyboardNav = true
  e.stopImmediatePropagation()
  stopAllStack[stopAllStack.length - 1][e.key]?.(e)
}, true)

export function useKeydown(
  map: KeyMap,
  options?: { capture?: boolean; stopAll?: boolean }
): () => void {
  if (options?.stopAll) {
    stopAllStack.push(map)
    return () => {
      const idx = stopAllStack.lastIndexOf(map)
      if (idx !== -1) stopAllStack.splice(idx, 1)
    }
  }
  const handler = (e: KeyboardEvent) => map[e.key]?.(e)
  window.addEventListener('keydown', handler, options?.capture)
  return () => window.removeEventListener('keydown', handler, options?.capture)
}

export function calcScrollOffset(
  cursorIdx: number, lineLength: number, charWidth: number, wrapWidth: number
): number {
  const lineWidthPx = lineLength * charWidth
  if (lineWidthPx <= wrapWidth) return 0
  const cursorPx = cursorIdx * charWidth
  const halfWrap = wrapWidth / 2
  return Math.max(0, Math.min(cursorPx - halfWrap, lineWidthPx - wrapWidth))
}

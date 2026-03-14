export function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function useKeydown(
  map: Record<string, (e: KeyboardEvent) => void>,
  options?: { capture?: boolean; stopAll?: boolean; when?: () => boolean }
) {
  $effect(() => {
    if (options?.when && !options.when()) return
    const handler = (e: KeyboardEvent) => {
      if (options?.stopAll) e.stopImmediatePropagation()
      map[e.key]?.(e)
    }
    window.addEventListener('keydown', handler, options?.capture)
    return () => window.removeEventListener('keydown', handler, options?.capture)
  })
}

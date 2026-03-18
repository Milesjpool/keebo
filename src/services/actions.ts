export interface HoverFocusOptions {
  guard?: () => boolean
  blurGuard?: () => boolean
  target?: () => HTMLElement | null
}

export function hoverFocus(node: HTMLElement, options?: HoverFocusOptions) {
  function enter() {
    if (options?.guard && !options.guard()) return
    const el = options?.target?.() ?? node
    el?.focus()
  }
  function leave() {
    if (options?.blurGuard && !options.blurGuard()) return
    const el = options?.target?.() ?? node
    el?.blur()
  }
  node.addEventListener('mouseenter', enter)
  node.addEventListener('mouseleave', leave)
  return {
    destroy() {
      node.removeEventListener('mouseenter', enter)
      node.removeEventListener('mouseleave', leave)
    },
  }
}

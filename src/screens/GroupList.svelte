<script lang="ts">
  import type { Group, Progress } from '../services/types'
  import { getGroupMedal, getMedal, EMOJI } from '../services/medals'
  import { hoverFocus } from '../services/actions'
  import Attribution from '../components/Attribution.svelte'

  interface Props {
    groups: Group[]
    progress: Progress
    onSelect: (i: number) => void
    focused: number
    authFocusEl?: HTMLElement | null
    source?: string
  }
  let { groups, progress, onSelect, focused = $bindable(0), authFocusEl, source }: Props = $props()

  let listEl = $state<HTMLUListElement | null>(null)
  let btnEls = $state<(HTMLButtonElement | null)[]>([])
  let topHeight = $state(0)
  let bottomHeight = $state(0)

  function updateFades() {
    if (!listEl) return
    const threshold = 32
    const maxH = 40
    topHeight = Math.min(listEl.scrollTop / threshold, 1) * maxH
    const remaining = listEl.scrollHeight - listEl.clientHeight - listEl.scrollTop
    bottomHeight = Math.min(remaining / threshold, 1) * maxH
  }

  $effect(() => {
    if (listEl) updateFades()
  })

  $effect(() => {
    if (!listEl) return
    listEl.querySelectorAll('li')[focused]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  $effect(() => {
    if (focused < 0) authFocusEl?.focus({ preventScroll: true })
    else btnEls[focused]?.focus({ preventScroll: true })
  })

  function groupState(i: number) {
    const g = groups[i]
    const done = g.lessons.filter(l => l.id in progress).length
    const locked = i > 0 && !(groups[i - 1].lessons[groups[i - 1].lessons.length - 1].id in progress)
    return { done, total: g.lessons.length, locked, complete: done === g.lessons.length }
  }

  const lastUnlocked = $derived(() => {
    let last = 0
    for (let i = 0; i < groups.length; i++) {
      if (!groupState(i).locked) last = i
      else break
    }
    return last
  })

  $effect(() => {
    function moveDown(e: KeyboardEvent) { e.preventDefault(); focused = Math.min(focused + 1, lastUnlocked()) }
    function moveUp(e: KeyboardEvent) {
      e.preventDefault()
      if (focused === 0) { focused = -1 }
      else focused = Math.max(focused - 1, 0)
    }
    function select() { if (!groupState(focused).locked) onSelect(focused) }

    const keymap: Record<string, (e: KeyboardEvent) => void> = {
      ArrowDown: moveDown, s: moveDown,
      ArrowUp: moveUp,    w: moveUp,
      Enter: (e) => { e.preventDefault(); select() }, ArrowRight: select, d: select,
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key in keymap) keymap[e.key](e)
      else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < groups.length) focused = idx
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })
</script>

<div class="list-wrap" style="--top-height: {topHeight}px; --bottom-height: {bottomHeight}px">
<ul bind:this={listEl} onscroll={updateFades}>
  {#each groups as group, i}
    {@const state = groupState(i)}
    <li>
      <button
        class="group-btn"
        class:locked={state.locked}
        class:complete={state.complete}
        bind:this={btnEls[i]}
        onclick={() => { focused = i; if (!state.locked) onSelect(i) }}
        onfocus={() => { focused = i }}
        use:hoverFocus={{ guard: () => !state.locked, target: () => btnEls[i] }}
        disabled={state.locked}
      >
        <span class="group-num">{String(i + 1).padStart(2, '0')}</span>
        <div class="group-info">
          <span class="group-title">{group.title}</span>

        </div>
        <span class="group-status">
          {#if state.locked}
            locked
          {:else}
            {@const gm = state.complete ? getGroupMedal(groups[i], progress) : null}
            {@const allGold = state.complete && groups[i].lessons.every(l => getMedal(progress[l.id]?.score) === 'gold')}
            {state.done}/{state.total}{#if allGold}<span class="group-medal">🏆</span>{:else if gm}<span class="group-medal">{EMOJI[gm]}</span>{/if}
          {/if}
        </span>
      </button>
    </li>
  {/each}
  {#if source}
    <li class="attribution"><Attribution text={source} /></li>
  {/if}
</ul>
</div>

<style>
  .attribution {
    text-align: center;
    padding: 0.75rem 0 0.25rem;
  }

  .list-wrap {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  .list-wrap::before,
  .list-wrap::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 1;
  }

  .list-wrap::before {
    top: 0;
    height: var(--top-height, 0px);
    background: linear-gradient(to bottom, var(--bg), transparent);
  }

  .list-wrap::after {
    bottom: 0;
    height: var(--bottom-height, 0px);
    background: linear-gradient(to top, var(--bg), transparent);
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    overflow-y: auto;
  }

  .group-btn {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
    padding: 1rem 1.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
  }

  .group-btn:not(.locked):focus {
    border-color: var(--accent);
    background: var(--surface-hover);
    outline: none;
  }

  .group-btn.complete {
    border-color: var(--border-done);
  }

  .group-btn.complete:focus {
    border-color: var(--accent);
  }

  .group-btn.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .group-num {
    font-size: 0.75rem;
    color: var(--muted);
    min-width: 1.5rem;
  }

  .group-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .group-title {
    font-size: 0.9rem;
    color: var(--text);
    text-transform: lowercase;
  }


  .group-status {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .group-btn.complete .group-status {
    color: var(--green);
  }

  .group-medal {
    margin-left: 0.3rem;
    font-size: 1rem;
  }
</style>

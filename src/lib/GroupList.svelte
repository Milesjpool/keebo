<script>
  import { getGroupMedal, getMedal, EMOJI } from './medals.js'

  let { groups, progress, onSelect, focused = $bindable(0) } = $props()

  let listEl = $state(null)
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

  function groupState(i) {
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
    function onKeydown(e) {
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault()
        focused = Math.min(focused + 1, lastUnlocked())
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        focused = Math.max(focused - 1, 0)
      } else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'd') {
        if (!groupState(focused).locked) onSelect(focused)
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < groups.length) focused = idx
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })
</script>

<div class="group-list">
  <header>
    <h1>keebo</h1>
    <p class="subtitle">touch typing, step by step</p>
  </header>

  <div class="list-wrap" style="--top-height: {topHeight}px; --bottom-height: {bottomHeight}px">
  <ul bind:this={listEl} onscroll={updateFades}>
    {#each groups as group, i}
      {@const state = groupState(i)}
      <li>
        <button
          class="group-btn"
          class:locked={state.locked}
          class:complete={state.complete}
          class:focused={focused === i}
          onclick={() => { focused = i; if (!state.locked) onSelect(i) }}
          onmouseenter={() => { if (!state.locked) focused = i }}
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
  </ul>
  </div>
</div>

<style>
  .group-list {
    max-width: 600px;
    margin: 0 auto;
    padding: 4rem 2rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
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

  header {
    margin-bottom: 3rem;
    flex-shrink: 0;
  }

  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: var(--correct);
    letter-spacing: 0.1em;
  }

  .subtitle {
    color: var(--muted);
    font-size: 0.875rem;
    margin-top: 0.25rem;
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

  .group-btn:not(.locked).focused {
    border-color: var(--accent);
    background: var(--surface-hover);
  }

  .group-btn.complete {
    border-color: var(--border-done);
  }

  .group-btn.complete.focused {
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

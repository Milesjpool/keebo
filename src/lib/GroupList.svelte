<script>
  let { groups, progress, onSelect, focused = $bindable(0) } = $props()

  function groupState(i) {
    const g = groups[i]
    const done = progress.slice(g.flatStart, g.flatStart + g.lessons.length).filter(Boolean).length
    const locked = i > 0 && !progress[groups[i - 1].flatStart + groups[i - 1].lessons.length - 1]
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

  <ul>
    {#each groups as group, i}
      {@const state = groupState(i)}
      <li>
        <button
          class="group-btn"
          class:locked={state.locked}
          class:complete={state.complete}
          class:focused={focused === i}
          onclick={() => { focused = i; if (!state.locked) onSelect(i) }}
          onmouseenter={() => focused = i}
          disabled={state.locked}
        >
          <span class="group-num">{String(i + 1).padStart(2, '0')}</span>
          <div class="group-info">
            <span class="group-title">{group.title}</span>
            <span class="group-keys">{group.keys.join('  ')}</span>
          </div>
          <span class="group-status">
            {#if state.locked}
              locked
            {:else if state.complete}
              done
            {:else}
              {state.done}/{state.total}
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .group-list {
    max-width: 600px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  header {
    margin-bottom: 3rem;
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

  .group-keys {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.15em;
  }

  .group-status {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .group-btn.complete .group-status {
    color: var(--green);
  }
</style>

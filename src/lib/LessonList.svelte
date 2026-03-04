<script>
  let { lessons, progress, onSelect } = $props()

  let focused = $state(0)

  function isLocked(i) {
    return i > 0 && !progress[i - 1]
  }

  const lastUnlocked = $derived(() => {
    const idx = lessons.findIndex((_, i) => isLocked(i))
    return idx === -1 ? lessons.length - 1 : idx - 1
  })

  $effect(() => {
    function onKeydown(e) {
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault()
        focused = Math.min(focused + 1, lastUnlocked())
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        focused = Math.max(focused - 1, 0)
      } else if (e.key === 'Enter') {
        if (!isLocked(focused)) onSelect(focused)
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < lessons.length) focused = idx
      }
    }

    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })
</script>

<div class="lesson-list">
  <header>
    <h1>keebo</h1>
    <p class="subtitle">touch typing, step by step</p>
  </header>

  <ul>
    {#each lessons as lesson, i}
      {@const done = progress[i]}
      {@const locked = isLocked(i)}
      <li>
        <button
          class="lesson-btn"
          class:done
          class:locked
          class:focused={focused === i}
          onclick={() => { focused = i; if (!locked) onSelect(i) }}
          onmouseenter={() => focused = i}
          disabled={locked}
        >
          <span class="lesson-num">{String(i + 1).padStart(2, '0')}</span>
          <div class="lesson-info">
            <span class="lesson-title">{lesson.title}</span>
            <span class="lesson-keys">{lesson.keys.join('  ')}</span>
          </div>
          <span class="lesson-status">
            {#if done}done{:else if locked}locked{:else}start{/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .lesson-list {
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

  .lesson-btn {
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

  .lesson-btn:not(.locked).focused {
    border-color: var(--accent);
    background: var(--surface-hover);
  }

  .lesson-btn.done {
    border-color: var(--border-done);
  }

  .lesson-btn.done.focused {
    border-color: var(--accent);
  }

  .lesson-btn.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .lesson-num {
    font-size: 0.75rem;
    color: var(--muted);
    min-width: 1.5rem;
  }

  .lesson-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .lesson-title {
    font-size: 0.9rem;
    color: var(--text);
  }

  .lesson-keys {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.15em;
  }

  .lesson-status {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .lesson-btn.done .lesson-status {
    color: var(--green);
  }
</style>

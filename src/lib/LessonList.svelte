<script>
  let { group, groupIdx, progress, onSelect, onBack, focused = $bindable(0) } = $props()

  function isLocked(i) {
    if (i === 0) return false
    return !(group.lessons[i - 1].id in progress)
  }

  const lastUnlocked = $derived(() => {
    for (let i = 0; i < group.lessons.length; i++) {
      if (isLocked(i)) return Math.max(0, i - 1)
    }
    return group.lessons.length - 1
  })

  const doneCount = $derived(
    group.lessons.filter(l => l.id in progress).length
  )

  $effect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'a') { onBack(); return }
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault()
        focused = Math.min(focused + 1, lastUnlocked())
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        focused = Math.max(focused - 1, 0)
      } else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'd') {
        if (!isLocked(focused)) onSelect(group.lessons[focused].flatIdx)
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < group.lessons.length) focused = idx
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
    <!-- Group header card — acts as back button -->
    <li>
      <button class="group-card" class:complete={doneCount === group.lessons.length} onclick={onBack}>
        <span class="group-num">{String(groupIdx + 1).padStart(2, '0')}</span>
        <div class="group-info">
          <span class="group-title">{group.title}</span>
          <span class="group-keys">{group.keys.join('  ')}</span>
        </div>
        <span class="group-status">
          {doneCount}/{group.lessons.length}
        </span>
      </button>
    </li>

    <!-- Lesson cards, tabbed in -->
    {#each group.lessons as lesson, i}
      {@const done = lesson.id in progress}
      {@const lessonStats = progress[lesson.id]}
      {@const locked = isLocked(i)}
      <li class="lesson-item">
        <button
          class="lesson-btn"
          class:done
          class:locked
          class:focused={focused === i}
          onclick={() => { focused = i; if (!locked) onSelect(lesson.flatIdx) }}
          onmouseenter={() => { if (!locked) focused = i }}
          disabled={locked}
        >
          <span class="lesson-num">{String(i + 1).padStart(2, '0')}</span>
          <span class="lesson-subtitle">{lesson.subtitle}</span>
          <span class="lesson-status">
            {#if done}{lessonStats?.wpm ? `${lessonStats.wpm} wpm · ${lessonStats.accuracy != null ? Math.round(lessonStats.accuracy * 100) + '%' : '?'}` : 'done'}{:else if locked}locked{:else}start{/if}
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

  /* Group header card */
  .group-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
    padding: 1rem 1.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    text-align: left;
    opacity: 0.7;
    transition: opacity 0.15s, border-color 0.15s;
  }

  .group-card:hover {
    opacity: 1;
    border-color: var(--accent);
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

  .group-card.complete .group-status {
    color: var(--green);
  }

  /* Lesson cards */
  .lesson-item {
    padding-left: 1.5rem;
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

  .lesson-subtitle {
    flex: 1;
    font-size: 0.9rem;
    color: var(--text);
  }

  .lesson-status {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .lesson-btn.done .lesson-status {
    color: var(--green);
  }
</style>

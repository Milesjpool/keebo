<script>
  let { lessons, progress, onSelect } = $props()
</script>

<div class="lesson-list">
  <header>
    <h1>keebo</h1>
    <p class="subtitle">touch typing, step by step</p>
  </header>

  <ul>
    {#each lessons as lesson, i}
      {@const done = progress[i]}
      {@const locked = i > 0 && !progress[i - 1]}
      <li>
        <button
          class="lesson-btn"
          class:done
          class:locked
          onclick={() => onSelect(i)}
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

  .lesson-btn:not(.locked):hover {
    border-color: var(--accent);
    background: #1a1a24;
  }

  .lesson-btn.done {
    border-color: #253525;
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

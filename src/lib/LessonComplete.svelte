<script>
  let { lesson, hasNext, onNext, onBack } = $props()

  $effect(() => {
    function onKeydown(e) {
      if (e.key === 'Enter') hasNext ? onNext() : onBack()
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })
</script>

<div class="complete-view">
  <div class="card">
    <div class="check">[ done ]</div>
    <h2>lesson complete</h2>
    <p class="lesson-name">{lesson.title}</p>
    <div class="actions">
      {#if hasNext}
        <button class="btn-primary" onclick={onNext}>next lesson →</button>
      {/if}
      <button class="btn-secondary" onclick={onBack}>back to lessons</button>
    </div>
  </div>
</div>

<style>
  .complete-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .card {
    text-align: center;
    max-width: 380px;
    width: 100%;
    padding: 3rem 2rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .check {
    font-size: 0.875rem;
    color: var(--green);
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--correct);
  }

  .lesson-name {
    font-size: 0.875rem;
    color: var(--muted);
    margin-bottom: 0.5rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: var(--cursor-text);
    border-radius: 6px;
    font-size: 0.875rem;
    transition: opacity 0.15s;
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    color: var(--muted);
    font-size: 0.875rem;
    transition: color 0.15s;
  }

  .btn-secondary:hover {
    color: var(--text);
  }
</style>

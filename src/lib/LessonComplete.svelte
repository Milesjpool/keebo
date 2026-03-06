<script>
  import { getMedal, EMOJI } from './medals.js'

  let { lesson, hasNext, stats, onNext, onBack } = $props()

  const medal = $derived(stats ? getMedal(stats.wpm * (stats.accuracy ?? 1)) : null)

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

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
    <h2>lesson complete</h2>
    <p class="lesson-name">{lesson.title}</p>
    {#if medal}
      <div class="podium">
        <span class="podium-emoji bronze">{EMOJI.bronze}</span>
        <span class="podium-emoji gold" class:unearned={medal !== 'gold'}>{EMOJI.gold}</span>
        <span class="podium-emoji silver" class:unearned={medal === 'bronze'}>{EMOJI.silver}</span>
      </div>
    {/if}
    {#if stats}
      <div class="stats">
        <div class="stat"><span class="stat-value">{stats.wpm}</span><span class="stat-label">wpm</span></div>
        <div class="stat"><span class="stat-value">{formatTime(stats.elapsed)}</span><span class="stat-label">time</span></div>
        <div class="stat"><span class="stat-value">{Math.round((stats.accuracy ?? 1) * 100)}%</span><span class="stat-label">accuracy</span></div>
      </div>
    {/if}
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

  h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--correct);
  }

  .podium {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    margin: 0.25rem 0;
  }

  .podium-emoji { line-height: 1; }
  .podium-emoji.gold   { font-size: 3rem; }
  .podium-emoji.silver { font-size: 2.25rem; }
  .podium-emoji.bronze { font-size: 1.75rem; }
  .podium-emoji.unearned { opacity: 0.15; filter: grayscale(1); }

  .stats {
    display: flex;
    gap: 2rem;
    margin: 0.5rem 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .stat-value {
    font-size: 1.5rem;
    color: var(--correct);
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.08em;
  }

  .lesson-name {
    font-size: 0.875rem;
    color: var(--muted);
    margin-bottom: 0.5rem;
    text-transform: lowercase;
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

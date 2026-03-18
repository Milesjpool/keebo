<script lang="ts">
  import type { Lesson, Stats, Difficulty } from '../services/types'
  import { getMedal, EMOJI } from '../services/medals'
  import { useKeydown } from '../services/utils'
  import { DIFFICULTY_MULTIPLIER, DIFFICULTY_LABELS } from '../services/difficulty'
  import { THRESHOLDS } from '../services/medals'

  interface Props { lesson: Lesson; hasNext: boolean; stats: Stats; difficulty?: Difficulty; onNext: () => void; onBack: () => void }
  let { lesson, hasNext, stats, difficulty = 'medium', onNext, onBack }: Props = $props()

  const medal = $derived(stats ? getMedal(stats.wpm * (stats.accuracy ?? 1) * DIFFICULTY_MULTIPLIER[difficulty]) : null)

  function verboseTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    if (m === 0) return `${sec}s`
    return `${m}m ${sec}s`
  }

  function ragColor(value: number, greenAt: number, neutralAt: number): string {
    if (value >= greenAt) return 'var(--green)'
    if (value >= neutralAt) return 'var(--text)'
    return 'var(--error)'
  }

  const wpmColor = $derived(ragColor(stats?.wpm ?? 0, THRESHOLDS.gold, THRESHOLDS.silver))
  const accColor = $derived(ragColor((stats?.accuracy ?? 1) * 100, 95, 80))
  const diffColor = $derived(ragColor(DIFFICULTY_MULTIPLIER[difficulty], 1.3, 1.0))

  let actionsEl = $state<HTMLDivElement | null>(null)

  function actionButtons(): HTMLButtonElement[] {
    return Array.from(actionsEl?.querySelectorAll('button') ?? [])
  }

  function navigate(dir: 1 | -1) {
    const btns = actionButtons()
    if (btns.length === 0) return
    const i = btns.indexOf(document.activeElement as HTMLButtonElement)
    if (i === -1) {
      btns[dir === 1 ? 0 : btns.length - 1]?.focus()
    } else {
      const next = btns[i + dir]
      if (next) next.focus()
    }
  }

  $effect(() => {
    setTimeout(() => actionButtons()[0]?.focus(), 0)
  })

  $effect(() => useKeydown({
    Enter: () => {
      const btns = actionButtons()
      const focused = btns.indexOf(document.activeElement as HTMLButtonElement)
      if (focused >= 0) btns[focused].click()
      else hasNext ? onNext() : onBack()
    },
    Escape: () => onBack(),
    ArrowDown: () => navigate(1),
    ArrowUp: () => navigate(-1),
  }))
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
        <div class="stat"><span class="stat-value" style:color={wpmColor}>{stats.wpm}</span><span class="stat-label">wpm</span></div>
        <div class="stat"><span class="stat-value" style:color={accColor}>{Math.round((stats.accuracy ?? 1) * 100)}%</span><span class="stat-label">accuracy</span></div>
        <div class="stat"><span class="stat-value" style:color={diffColor}>{DIFFICULTY_MULTIPLIER[difficulty]}x</span><span class="stat-label">{DIFFICULTY_LABELS[difficulty]}</span></div>
      </div>
      <div class="stat"><span class="stat-value time-value">{verboseTime(stats.elapsed)}</span><span class="stat-label">elapsed</span></div>
    {/if}
    <div class="actions" bind:this={actionsEl}>
      {#if hasNext}
        <button class="btn-primary" onclick={onNext}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}>next lesson →</button>
      {/if}
      <button class="btn-secondary" onclick={onBack}
        onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
        onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}>back to lessons</button>
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
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.08em;
  }

  .lesson-name {
    font-size: 0.875rem;
    color: var(--muted);
    margin-bottom: 0;
    text-transform: lowercase;
  }

  .time-value {
    color: var(--text);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-top: 1.5rem;
  }


</style>

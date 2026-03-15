<script lang="ts">
  import type { Group, Progress } from '../services/types'
  import type { User } from 'firebase/auth'
  import { getMedal, getGroupMedal, EMOJI } from '../services/medals'
  import AuthButton from '../components/AuthButton.svelte'

  interface Props {
    group: Group
    groupIdx: number
    progress: Progress
    onSelect: (fi: number) => void
    onBack: () => void
    focused: number
    context: { screen: string; groupIdx: number; flatIdx?: number; lessonId?: string }
    user: User | null
    authReady: boolean
    onSignIn: (p: string) => Promise<void>
    onSignOut: () => Promise<void>
    onLinkProvider: (p: string) => Promise<void>
    onDeleteAccount?: () => Promise<void>
    onDeleteProgress?: () => void
  }
  let { group, groupIdx, progress, onSelect, onBack, focused = $bindable(0), context, user, authReady, onSignIn, onSignOut, onLinkProvider, onDeleteAccount, onDeleteProgress }: Props = $props()

  let listEl = $state<HTMLUListElement | null>(null)
  let authFocusEl = $state<HTMLElement | null>(null)
  let backBtnEl = $state<HTMLButtonElement | null>(null)
  let btnEls = $state<(HTMLButtonElement | null)[]>([])
  let topHeight = $state(0)
  let bottomHeight = $state(0)

  function updateFades() {
    if (!listEl) return
    const threshold = 32
    topHeight = Math.min(listEl.scrollTop / threshold, 1) * 16
    const remaining = listEl.scrollHeight - listEl.clientHeight - listEl.scrollTop
    bottomHeight = Math.min(remaining / threshold, 1) * 40
  }

  $effect(() => {
    if (listEl) updateFades()
  })

  $effect(() => {
    if (!listEl) return
    listEl.querySelectorAll('li')[focused]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  $effect(() => {
    if (focused === -2) authFocusEl?.focus({ preventScroll: true })
    else if (focused === -1) backBtnEl?.focus({ preventScroll: true })
    else btnEls[focused]?.focus({ preventScroll: true })
  })

  function isLocked(i: number) {
    if (i === 0) return false
    return !(group.lessons[i - 1].id in progress)
  }

  const lastUnlocked = $derived(() => {
    for (let i = 0; i < group.lessons.length; i++) {
      if (isLocked(i)) return Math.max(0, i - 1)
    }
    return group.lessons.length - 1
  })

  const doneCount = $derived(group.lessons.filter(l => l.id in progress).length)
  const allDone = $derived(doneCount === group.lessons.length)
  const groupMedal = $derived(allDone ? getGroupMedal(group, progress) : null)
  const groupAllGold = $derived(allDone && group.lessons.every(l => getMedal(progress[l.id]?.score) === 'gold'))

  $effect(() => {
    function moveDown(e: KeyboardEvent) {
      e.preventDefault()
      focused = Math.min(focused + 1, lastUnlocked())
    }
    function moveUp(e: KeyboardEvent) {
      e.preventDefault()
      if (focused > 0) focused--
      else if (focused === 0) focused = -1
      else { focused = -2 }
    }
    function select() {
      if (focused === -1) onBack()
      else if (!isLocked(focused)) onSelect(group.lessons[focused].flatIdx)
    }

    const keymap: Record<string, (e: KeyboardEvent) => void> = {
      Escape: onBack,    ArrowLeft: onBack, a: onBack,
      ArrowDown: moveDown, s: moveDown,
      ArrowUp: moveUp,     w: moveUp,
      Enter: (e) => { e.preventDefault(); select() }, ArrowRight: select, d: select,
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key in keymap) keymap[e.key](e)
      else if (/^[1-9]$/.test(e.key)) {
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
    <div class="header-left">
      <h1>keebo</h1>
      <p class="subtitle">touch typing, step by step</p>
    </div>
    <AuthButton {user} {authReady} {context} {onSignIn} {onSignOut} {onLinkProvider} {onDeleteAccount} {onDeleteProgress} bind:focusEl={authFocusEl} onDescend={() => { focused = -1 }} onAscend={() => { focused = -2 }} />
  </header>

  <!-- Group header card — pinned, acts as back button -->
  <div class="group-header">
    <button class="group-card" class:complete={doneCount === group.lessons.length} bind:this={backBtnEl} onclick={onBack} onfocus={() => { focused = -1 }} onmouseenter={() => backBtnEl?.focus()} onmouseleave={() => backBtnEl?.blur()}>
      <span class="group-num">←</span>
      <div class="group-info">
        <span class="group-title">{group.title}</span>
      </div>
      <span class="group-status">
        {doneCount}/{group.lessons.length}{#if groupAllGold}<span class="group-medal">🏆</span>{:else if groupMedal}<span class="group-medal">{EMOJI[groupMedal]}</span>{/if}
      </span>
    </button>
  </div>

  <div class="list-wrap" style="--top-height: {topHeight}px; --bottom-height: {bottomHeight}px">
    <ul bind:this={listEl} onscroll={updateFades}>
      {#each group.lessons as lesson, i}
        {@const done = lesson.id in progress}
        {@const lessonStats = progress[lesson.id]}
        {@const locked = isLocked(i)}
        <li class="lesson-item">
          <button
            class="lesson-btn"
            class:done
            class:locked
            bind:this={btnEls[i]}
            onclick={() => { focused = i; if (!locked) onSelect(lesson.flatIdx) }}
            onfocus={() => { focused = i }}
            onmouseenter={() => { if (!locked) btnEls[i]?.focus() }}
            onmouseleave={() => btnEls[i]?.blur()}
            disabled={locked}
          >
            <span class="lesson-num">{String(i + 1).padStart(2, '0')}</span>
            <span class="lesson-subtitle">{lesson.subtitle}</span>
            <span class="lesson-status">
              {#if done}{lessonStats?.wpm ? `${lessonStats.wpm} wpm · ${lessonStats.accuracy != null ? Math.round(lessonStats.accuracy * 100) + '%' : '?'}` : 'done'}{:else if locked}locked{:else}start{/if}{#if done}{@const m = getMedal(lessonStats?.score)}{#if m}<span class="lesson-medal">{EMOJI[m]}</span>{/if}{/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .lesson-list {
    max-width: 600px;
    margin: 0 auto;
    padding: 4rem 2rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    margin-bottom: 3rem;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .header-left {
    display: flex;
    flex-direction: column;
  }

  .group-header {
    flex-shrink: 0;
    margin-bottom: 0.5rem;
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

  .group-card:focus {
    opacity: 1;
    border-color: var(--accent);
    outline: none;
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

  .group-card.complete .group-status {
    color: var(--green);
  }

  .group-medal {
    margin-left: 0.3rem;
    font-size: 1rem;
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

  .lesson-btn:not(.locked):focus {
    border-color: var(--accent);
    background: var(--surface-hover);
    outline: none;
  }

  .lesson-btn.done {
    border-color: var(--border-done);
  }

  .lesson-btn.done:focus {
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
    text-transform: lowercase;
  }

  .lesson-status {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .lesson-btn.done .lesson-status {
    color: var(--green);
  }

  .lesson-medal {
    margin-left: 0.3rem;
    font-size: 1rem;
  }
</style>

<script>
  import FingerIndicator from './FingerIndicator.svelte'

  let { lesson, onComplete, onBack } = $props()

  let lineIndex = $state(0)
  let typed = $state('')
  let shaking = $state(false)
  let startTime = $state(null)
  let elapsed = $state(0)
  const line = $derived(lesson.lines[lineIndex])
  const total = $derived(lesson.lines.length)

  $effect(() => {
    if (!startTime) return
    const id = setInterval(() => { elapsed = Math.floor((Date.now() - startTime) / 1000) }, 500)
    return () => clearInterval(id)
  })

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  $effect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        onBack()
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (typed === line) {
          if (lineIndex < total - 1) {
            lineIndex++
            typed = ''
          } else {
            const secs = startTime ? (Date.now() - startTime) / 1000 : 1
            const chars = lesson.lines.reduce((n, l) => n + l.length, 0)
            onComplete({ wpm: Math.round((chars / 5) / (secs / 60)), elapsed: Math.round(secs) })
          }
        } else {
          if (!shaking) {
            shaking = true
            setTimeout(() => { shaking = false }, 400)
          }
        }
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        typed = typed.slice(0, -1)
        return
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!startTime) startTime = Date.now()
        if (typed.length < line.length) typed += e.key
      }
    }

    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })

  const currentChar = $derived(typed.length < line.length ? line[typed.length] : '\n')

  function charState(i) {
    if (i < typed.length) return typed[i] === line[i] ? 'correct' : 'error'
    if (i === typed.length) return 'cursor'
    return 'untyped'
  }
</script>

<div class="typing-view">
  <nav>
    <button class="back-btn" onclick={onBack}>← back</button>
    <span class="timer">{startTime ? formatTime(elapsed) : ''}</span>
    <span class="accuracy"></span>
  </nav>

  <div class="progress-bar">
    {#each lesson.lines as _, i}
      <div class="segment">
        <div class="fill" style:width="{
          i < lineIndex ? 100 :
          i === lineIndex ? typed.length / line.length * 100 :
          0
        }%"></div>
      </div>
    {/each}
  </div>

  <main>
    <div class="line-wrap" class:shaking>
      <div class="line-display">
        {#each line.split('') as char, i}<span class="char {charState(i)}">{char === ' ' ? '\u00a0' : char}</span>{/each}<span class="char" class:cursor={typed.length === line.length} style:visibility={typed.length === line.length ? 'visible' : 'hidden'}>↵</span>
      </div>
    </div>
    <FingerIndicator char={currentChar} />
  </main>
</div>

<style>
  .typing-view {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border);
  }

  .back-btn {
    font-size: 0.875rem;
    color: var(--muted);
    transition: color 0.15s;
  }

  .back-btn:hover {
    color: var(--text);
  }

  .timer {
    font-size: 0.875rem;
    color: var(--muted);
    min-width: 2.5rem;
    text-align: center;
  }

  .accuracy {
    font-size: 0.875rem;
    color: var(--muted);
    min-width: 3rem;
    text-align: right;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 2rem;
  }

  .progress-bar {
    display: flex;
    gap: 2px;
    height: 3px;
  }

  .segment {
    flex: 1;
    background: var(--border);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.05s linear;
  }

  .line-wrap {
    padding: 1rem;
  }

  .line-wrap.shaking {
    animation: shake 0.4s ease-in-out;
  }

  .line-display {
    font-size: 1.75rem;
    letter-spacing: 0.05em;
    white-space: pre;
    line-height: 1;
  }

  .char {
    display: inline-block;
    border-radius: 2px;
  }

  .char.untyped {
    color: var(--dim);
  }

  .char.correct {
    color: var(--correct);
  }

  .char.error {
    color: var(--error);
    background: var(--error-bg);
  }

  .char.cursor {
    color: var(--cursor-text);
    background: var(--cursor-bg);
    animation: blink 1s step-end infinite;
  }


</style>

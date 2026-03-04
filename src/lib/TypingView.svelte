<script>
  let { lesson, onComplete, onBack } = $props()

  let lineIndex = $state(0)
  let typed = $state('')
  let shaking = $state(false)

  const line = $derived(lesson.lines[lineIndex])
  const total = $derived(lesson.lines.length)

  $effect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') {
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
            onComplete()
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
        if (typed.length < line.length) {
          typed += e.key
        }
      }
    }

    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  })

  function charState(i) {
    if (i < typed.length) return typed[i] === line[i] ? 'correct' : 'error'
    if (i === typed.length) return 'cursor'
    return 'untyped'
  }
</script>

<div class="typing-view">
  <nav>
    <button class="back-btn" onclick={onBack}>← back</button>
    <span class="lesson-title">{lesson.title}</span>
    <span class="line-progress">{lineIndex + 1} / {total}</span>
  </nav>

  <main>
    <div class="line-wrap" class:shaking>
      <div class="line-display">
        {#each line.split('') as char, i}<span class="char {charState(i)}">{char === ' ' ? '\u00a0' : char}</span>{/each}<span class="char" class:cursor={typed.length === line.length} style:visibility={typed.length === line.length ? 'visible' : 'hidden'}>↵</span>
      </div>
    </div>
    <p class="hint">enter to advance · esc to go back</p>
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

  .lesson-title {
    font-size: 0.875rem;
    color: var(--muted);
  }

  .line-progress {
    font-size: 0.875rem;
    color: var(--muted);
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

.hint {
    font-size: 0.75rem;
    color: var(--dim);
    letter-spacing: 0.05em;
  }
</style>

<script lang="ts">
  const TITLE = 'keebo'
  let titleActive = $state(false)
  let titleTyped = $state(0)
  let confetti = $state<{ id: number; x: number; y: number; color: string }[]>([])

  function resetTitle() {
    titleActive = false
    titleTyped = 0
  }

  function onMouseLeave() {
    // keyboard-nav sets pointer-events: none, triggering spurious mouseleave — ignore it
    if (document.body.classList.contains('keyboard-nav')) return
    resetTitle()
  }

  function spawnConfetti() {
    const colors = ['var(--correct)', 'var(--accent)', 'var(--green)', 'var(--error)']
    confetti = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.8) * 250,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setTimeout(() => { confetti = [] }, 1000)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key.length === 1 || e.key === 'Enter') {
      // Swallow printable chars + Enter so they don't reach list handlers
      e.stopImmediatePropagation()
      e.preventDefault()
      if (titleTyped < 5 && e.key === TITLE[titleTyped]) {
        titleTyped++
      } else if (titleTyped === 5 && e.key === 'Enter') {
        spawnConfetti()
        resetTitle()
      } else if (e.key.length === 1) {
        titleTyped = 0
      }
    } else if (e.key.startsWith('Arrow')) {
      // Deactivate title and let the arrow key propagate to list handlers
      resetTitle()
    }
  }

  $effect(() => {
    if (!titleActive) return
    window.addEventListener('keydown', onKeydown, true)
    return () => window.removeEventListener('keydown', onKeydown, true)
  })
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<h1 class="title-type" onmouseenter={() => { (document.activeElement as HTMLElement)?.blur(); titleActive = true }} onmouseleave={onMouseLeave}>
  {#each TITLE.split('') as char, i}
    <span class="tchar" class:correct={i < titleTyped} class:cursor={i === titleTyped && titleActive} class:dim={i > titleTyped && titleActive}>{char}</span>{/each}{#if titleTyped === 5}<span class="tchar cursor">↵</span>{/if}
  {#each confetti as p (p.id)}
    <span
      class="confetti-particle"
      style="--x: {p.x}px; --y: {p.y}px; background: {p.color};"
    ></span>
  {/each}
</h1>

<style>
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: var(--correct);
    letter-spacing: 0.1em;
    margin-left: -0.08em;
    transition: font-size 0.5s ease;
    position: relative;
    cursor: default;
  }

  :global(.hero) h1 {
    font-size: 4.35rem;
  }

  .tchar.dim {
    opacity: 0.35;
  }

  .tchar.cursor {
    color: var(--cursor-text);
    background: var(--cursor-bg);
    border-radius: 2px;
    animation: blink 1s step-end infinite;
  }

  .confetti-particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 1px;
    pointer-events: none;
    animation: confetti-pop 0.8s ease-out forwards;
  }

  @keyframes confetti-pop {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
  }
</style>

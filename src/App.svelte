<script>
  import lessons from './lessons.json'
  import LessonList from './lib/LessonList.svelte'
  import TypingView from './lib/TypingView.svelte'
  import LessonComplete from './lib/LessonComplete.svelte'

  let screen = $state('list')
  let currentIndex = $state(0)
  let progress = $state(new Array(lessons.length).fill(false))

  const THEMES = ['dark', 'light', 'auto']
  const ICONS  = { dark: '🌛', light: '🌞', auto: '🌍' }

  let theme = $state(localStorage.getItem('theme') ?? 'auto')
  let label = $state('')
  let timers = []

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  })

  function animateLabel(text) {
    timers.forEach(clearTimeout)
    timers = []
    label = ''
    // Type in
    for (let i = 1; i <= text.length; i++) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, i * 30))
    }
    // Pause then delete
    const deleteStart = text.length * 30 + 800
    for (let i = text.length - 1; i >= 0; i--) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, deleteStart + (text.length - i) * 22))
    }
  }

  function toggleTheme() {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    animateLabel(theme)
  }

  function startLesson(index) {
    currentIndex = index
    screen = 'typing'
  }

  function completeLesson() {
    progress[currentIndex] = true
    screen = 'complete'
  }

  function nextLesson() {
    const next = currentIndex + 1
    if (next < lessons.length) {
      currentIndex = next
      screen = 'typing'
    } else {
      screen = 'list'
    }
  }

  function goBack() {
    screen = 'list'
  }
</script>

{#if screen === 'list'}
  <LessonList {lessons} {progress} onSelect={startLesson} />
{:else if screen === 'typing'}
  <TypingView lesson={lessons[currentIndex]} onComplete={completeLesson} onBack={goBack} />
{:else if screen === 'complete'}
  <LessonComplete
    lesson={lessons[currentIndex]}
    hasNext={currentIndex < lessons.length - 1}
    onNext={nextLesson}
    onBack={goBack}
  />
{/if}

<a class="author" href="https://www.milesjpool.com" target="_blank" rel="noreferrer">👾 Miles</a>

<p class="footer">🤖 AI Coded, Human Approved</p>

<button class="theme-toggle" onclick={e => { toggleTheme(); e.currentTarget.blur() }}>
  <span class="label">{label}</span>{ICONS[theme]}
</button>

<style>
  .author {
    position: fixed;
    bottom: 1.5rem;
    left: 1.75rem;
    font-size: 0.75rem;
    color: var(--muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .author:hover {
    color: var(--text);
  }

  .footer {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: var(--muted);
    white-space: nowrap;
  }

  .theme-toggle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.75rem;
    font-size: 0.75rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.15s;
  }

  .theme-toggle:hover {
    color: var(--text);
  }

  .label {
    color: var(--muted);
    min-width: 0;
  }
</style>

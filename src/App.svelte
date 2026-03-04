<script>
  import rawGroups from './lessons.json'
  import GroupList from './lib/GroupList.svelte'
  import LessonList from './lib/LessonList.svelte'
  import TypingView from './lib/TypingView.svelte'
  import LessonComplete from './lib/LessonComplete.svelte'

  // Annotate each group and lesson with flat indices (computed once, data is static)
  let flatIdx = 0
  const groups = rawGroups.map(g => ({
    ...g,
    flatStart: flatIdx,
    lessons: g.lessons.map(l => ({
      ...l,
      flatIdx: flatIdx++,
      title: `${g.title} · ${l.subtitle}`,
      keys: g.keys,
    }))
  }))

  const flatLessons = groups.flatMap(g => g.lessons)

  let screen = $state('groups')
  let currentGroupIdx = $state(0)
  let currentFlatIdx = $state(0)

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('keebo-progress') ?? '[]')
      const base = new Array(flatLessons.length).fill(false)
      saved.forEach((v, i) => { if (i < base.length) base[i] = v })
      return base
    } catch {
      return new Array(flatLessons.length).fill(false)
    }
  }

  let progress = $state(loadProgress())

  $effect(() => {
    localStorage.setItem('keebo-progress', JSON.stringify(progress))
  })

  function lastUnlockedGroup() {
    let last = 0
    for (let i = 0; i < groups.length; i++) {
      const locked = i > 0 && !progress[groups[i - 1].flatStart + groups[i - 1].lessons.length - 1]
      if (!locked) last = i
      else break
    }
    return last
  }

  function lastUnlockedLesson(groupIdx) {
    const g = groups[groupIdx]
    for (let i = 0; i < g.lessons.length; i++) {
      const fi = g.lessons[i].flatIdx
      if (fi > 0 && !progress[fi - 1]) return Math.max(0, i - 1)
    }
    return g.lessons.length - 1
  }

  let groupFocused  = $state(lastUnlockedGroup())
  let lessonFocused = $state(groups.map((_, i) => lastUnlockedLesson(i)))

  function findGroupIdx(fi) {
    return groups.findIndex(g => fi >= g.flatStart && fi < g.flatStart + g.lessons.length)
  }

  function openGroup(groupIdx) {
    currentGroupIdx = groupIdx
    screen = 'lessons'
  }

  function startLesson(fi) {
    currentFlatIdx = fi
    currentGroupIdx = findGroupIdx(fi)
    screen = 'typing'
  }

  let lastStats = $state(null)

  function completeLesson(stats) {
    progress[currentFlatIdx] = true
    lastStats = stats
    screen = 'complete'
  }

  function nextLesson() {
    const next = currentFlatIdx + 1
    if (next < flatLessons.length) {
      currentFlatIdx = next
      currentGroupIdx = findGroupIdx(next)
      screen = 'typing'
    } else {
      screen = 'groups'
    }
  }

  function goToLessons() {
    screen = 'lessons'
  }

  function goToGroups() {
    screen = 'groups'
  }

  // Theme
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
    for (let i = 1; i <= text.length; i++) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, i * 30))
    }
    const deleteStart = text.length * 30 + 800
    for (let i = text.length - 1; i >= 0; i--) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, deleteStart + (text.length - i) * 22))
    }
  }

  function toggleTheme() {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    animateLabel(theme)
  }
</script>

{#if screen === 'groups'}
  <GroupList {groups} {progress} onSelect={openGroup} bind:focused={groupFocused} />
{:else if screen === 'lessons'}
  <LessonList group={groups[currentGroupIdx]} groupIdx={currentGroupIdx} {progress} onSelect={startLesson} onBack={goToGroups} bind:focused={lessonFocused[currentGroupIdx]} />
{:else if screen === 'typing'}
  <TypingView lesson={flatLessons[currentFlatIdx]} onComplete={completeLesson} onBack={goToLessons} />
{:else if screen === 'complete'}
  <LessonComplete
    lesson={flatLessons[currentFlatIdx]}
    hasNext={currentFlatIdx < flatLessons.length - 1}
    stats={lastStats}
    onNext={nextLesson}
    onBack={goToLessons}
  />
{/if}

<a class="author" href="https://www.milesjpool.com" target="_blank" rel="noreferrer">👾 Miles</a>

<p class="footer">🤖 <strong>AI</strong> Coded, Human Approved</p>

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

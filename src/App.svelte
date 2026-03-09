<script>
  import lessonsData from './lessons.json'
  const rawGroups = lessonsData.groups
  import GroupList from './lib/GroupList.svelte'
  import LessonList from './lib/LessonList.svelte'
  import TypingView from './lib/TypingView.svelte'
  import LessonComplete from './lib/LessonComplete.svelte'
  import { auth, db, googleProvider, githubProvider } from './lib/firebase.js'
  import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
  import { doc, getDoc, setDoc } from 'firebase/firestore'

  // Annotate each group and lesson with flat indices (computed once, data is static)
  let flatIdx = 0
  const groups = rawGroups.map(g => ({
    ...g,
    flatStart: flatIdx,
    lessons: g.lessons.map(l => ({
      ...l,
      flatIdx: flatIdx++,
      title: `${g.title} · ${l.subtitle}`,

    }))
  }))

  const flatLessons = groups.flatMap(g => g.lessons)

  // URL routing
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') // '/keebo'

  function getUrl(scr, gi, fi) {
    if (scr === 'groups') return BASE + '/'
    if (scr === 'lessons') return `${BASE}/group/${gi + 1}`
    if (scr === 'typing') {
      const li = fi - groups[gi].flatStart
      return `${BASE}/group/${gi + 1}/lesson/${li + 1}`
    }
    return BASE + '/'
  }

  function parseUrl(pathname) {
    const p = pathname.slice(BASE.length) || '/'
    let m = p.match(/^\/group\/(\d+)\/lesson\/(\d+)/)
    if (m) {
      const gi = +m[1] - 1, li = +m[2] - 1
      if (gi >= 0 && gi < groups.length) {
        const fi = groups[gi].flatStart + li
        if (fi >= 0 && fi < flatLessons.length)
          return { screen: 'typing', groupIdx: gi, flatIdx: fi }
      }
    }
    m = p.match(/^\/lesson\/([0-9a-f-]{36})/)
    if (m) {
      const fi = flatLessons.findIndex(l => l.id === m[1])
      if (fi >= 0) return { screen: 'typing', groupIdx: findGroupIdx(fi), flatIdx: fi }
    }
    m = p.match(/^\/group\/(\d+)$/)
    if (m) {
      const gi = +m[1] - 1
      if (gi >= 0 && gi < groups.length)
        return { screen: 'lessons', groupIdx: gi, flatIdx: 0 }
    }
    return { screen: 'groups', groupIdx: 0, flatIdx: 0 }
  }

  const init = parseUrl(window.location.pathname)

  let screen = $state(init.screen)
  let currentGroupIdx = $state(init.groupIdx)
  let currentFlatIdx = $state(init.flatIdx)

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('keebo-progress') ?? '{}')
      if (typeof saved === 'object' && saved !== null && !Array.isArray(saved)) return saved
    } catch {}
    return {}
  }

  let progress = $state(loadProgress())
  let user = $state(null)
  let authReady = $state(false)

  $effect(() => {
    localStorage.setItem('keebo-progress', JSON.stringify(progress))
  })

  function mergeProgress(local, remote) {
    const merged = { ...remote }
    for (const [id, rec] of Object.entries(local)) {
      if (!merged[id] || rec.score > (merged[id].score ?? 0)) merged[id] = rec
    }
    return merged
  }

  async function syncOnSignIn(u) {
    const ref = doc(db, 'users', u.uid)
    const snap = await getDoc(ref)
    const remote = snap.exists() ? (snap.data().progress ?? {}) : {}
    const merged = mergeProgress(progress, remote)
    progress = merged
    await setDoc(ref, { progress: merged }, { merge: true })
  }

  $effect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      user = u
      authReady = true
      if (u) await syncOnSignIn(u)
    })
    return unsub
  })

  async function signIn(provider) {
    const p = provider === 'google' ? googleProvider : githubProvider
    await signInWithPopup(auth, p)
  }

  async function handleSignOut() {
    await signOut(auth)
    user = null
  }

  function isDone(lesson) {
    return lesson.id in progress
  }

  function lastUnlockedGroup() {
    let last = 0
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i]
      const locked = i > 0 && !isDone(groups[i - 1].lessons[groups[i - 1].lessons.length - 1])
      if (!locked) last = i
      else break
    }
    return last
  }

  function lastUnlockedLesson(groupIdx) {
    const g = groups[groupIdx]
    for (let i = 0; i < g.lessons.length; i++) {
      const fi = g.lessons[i].flatIdx
      if (fi > 0 && !isDone(flatLessons[fi - 1])) return Math.max(0, i - 1)
    }
    return g.lessons.length - 1
  }

  let groupFocused  = $state(init.screen === 'groups' ? lastUnlockedGroup() : init.groupIdx)
  let lessonFocused = $state(groups.map((_, i) => {
    if (init.screen === 'typing' && i === init.groupIdx)
      return init.flatIdx - groups[i].flatStart
    return lastUnlockedLesson(i)
  }))

  function findGroupIdx(fi) {
    return groups.findIndex(g => fi >= g.flatStart && fi < g.flatStart + g.lessons.length)
  }

  function navigate(scr, gi, fi) {
    screen = scr; currentGroupIdx = gi; currentFlatIdx = fi
    history.pushState(null, '', getUrl(scr, gi, fi))
  }

  function openGroup(groupIdx) {
    navigate('lessons', groupIdx, currentFlatIdx)
  }

  function startLesson(fi) {
    navigate('typing', findGroupIdx(fi), fi)
  }

  let lastStats = $state(null)

  function completeLesson(stats) {
    const id = flatLessons[currentFlatIdx].id
    const prev = progress[id]
    const score = stats.wpm * (stats.accuracy ?? 1)
    const newRecord = { wpm: stats.wpm, elapsed: stats.elapsed, accuracy: stats.accuracy ?? 1, score }
    progress[id] = (!prev || score > (prev.score ?? 0)) ? newRecord : prev
    if (user) {
      const ref = doc(db, 'users', user.uid)
      setDoc(ref, { progress }, { merge: true })
    }
    lastStats = stats
    screen = 'complete'
    // URL stays at the lesson URL (no pushState)
  }

  function nextLesson() {
    const next = currentFlatIdx + 1
    if (next < flatLessons.length) {
      navigate('typing', findGroupIdx(next), next)
    } else {
      navigate('groups', 0, 0)
    }
  }

  function goToLessons() {
    navigate('lessons', currentGroupIdx, currentFlatIdx)
  }

  function goToGroups() {
    navigate('groups', 0, 0)
  }

  $effect(() => {
    function onPopstate() {
      const s = parseUrl(window.location.pathname)
      screen = s.screen; currentGroupIdx = s.groupIdx; currentFlatIdx = s.flatIdx
    }
    window.addEventListener('popstate', onPopstate)
    return () => window.removeEventListener('popstate', onPopstate)
  })

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
  <GroupList {groups} {progress} onSelect={openGroup} bind:focused={groupFocused}
    {user} {authReady} onSignIn={signIn} onSignOut={handleSignOut} />
{:else if screen === 'lessons'}
  <LessonList group={groups[currentGroupIdx]} groupIdx={currentGroupIdx} {progress} onSelect={startLesson} onBack={goToGroups} bind:focused={lessonFocused[currentGroupIdx]}
    {user} {authReady} onSignIn={signIn} onSignOut={handleSignOut} />
{:else if screen === 'typing'}
  <TypingView lesson={flatLessons[currentFlatIdx]} onComplete={completeLesson} onBack={goToLessons} strictMode={false} />
{:else if screen === 'complete'}
  <LessonComplete
    lesson={flatLessons[currentFlatIdx]}
    hasNext={currentFlatIdx < flatLessons.length - 1}
    stats={lastStats}
    onNext={nextLesson}
    onBack={goToLessons}
  />
{/if}

<div class="mobile-message">
  <p>keebo needs a real keyboard ⌨️</p>
  <p>come back on a laptop or desktop</p>
</div>

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

  .mobile-message {
    display: none;
  }

  @media (hover: none) and (pointer: coarse) {
    .mobile-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      position: fixed;
      inset: 0;
      background: var(--bg);
      z-index: 100;
      text-align: center;
      padding: 2rem;
    }

    .mobile-message p:first-child {
      font-size: 1.25rem;
      color: var(--text);
    }

    .mobile-message p:last-child {
      font-size: 0.875rem;
      color: var(--muted);
    }
  }
</style>

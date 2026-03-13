<script lang="ts">
  import type { Stats, Screen, Group } from "./lib/types";
  import lessonsData from "./lessons.json";
  const rawGroups = lessonsData.groups;
  import GroupList from "./lib/GroupList.svelte";
  import LessonList from "./lib/LessonList.svelte";
  import TypingView from "./lib/TypingView.svelte";
  import LessonComplete from "./lib/LessonComplete.svelte";
  import { auth, googleProvider, githubProvider } from "./lib/firebase";
  import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
  import { getUrl, parseUrl, findGroupIdx } from "./lib/router";
  import { loadProgress, saveProgress } from "./lib/progress";
  import { fetchAndMerge, writeProgress } from "./lib/sync";
  import Footer from "./lib/Footer.svelte";

  // Annotate each group and lesson with flat indices (computed once, data is static)
  let flatIdx = 0;
  const groups: Group[] = rawGroups.map((g) => ({
    ...g,
    flatStart: flatIdx,
    lessons: g.lessons.map((l) => ({
      ...l,
      flatIdx: flatIdx++,
      title: `${g.title} · ${l.subtitle}`,
    })),
  }));

  const flatLessons = groups.flatMap((g) => g.lessons);

  const init = parseUrl(groups, flatLessons, window.location.pathname);

  let screen = $state(init.screen);
  let currentGroupIdx = $state(init.groupIdx);
  let currentFlatIdx = $state(init.flatIdx);

  let progress = $state(loadProgress());
  let user = $state<User | null>(null);
  let authReady = $state(false);

  $effect(() => {
    saveProgress(progress);
  });

  $effect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      user = u;
      authReady = true;
      if (u) progress = await fetchAndMerge(u.uid, progress);
    });
    return unsub;
  });

  async function signIn(provider: string) {
    const p = provider === "google" ? googleProvider : githubProvider;
    await signInWithPopup(auth, p);
  }

  async function handleSignOut() {
    await signOut(auth);
    user = null;
  }

  function isDone(lesson: { id: string }) {
    return lesson.id in progress;
  }

  function lastUnlockedGroup() {
    let last = 0;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const locked =
        i > 0 &&
        !isDone(groups[i - 1].lessons[groups[i - 1].lessons.length - 1]);
      if (!locked) last = i;
      else break;
    }
    return last;
  }

  function lastUnlockedLesson(groupIdx: number) {
    const g = groups[groupIdx];
    for (let i = 0; i < g.lessons.length; i++) {
      const fi = g.lessons[i].flatIdx;
      if (fi > 0 && !isDone(flatLessons[fi - 1])) return Math.max(0, i - 1);
    }
    return g.lessons.length - 1;
  }

  let groupFocused = $state(
    init.screen === "groups" ? lastUnlockedGroup() : init.groupIdx,
  );
  let lessonFocused = $state(
    groups.map((_, i) => {
      if (init.screen === "typing" && i === init.groupIdx)
        return init.flatIdx - groups[i].flatStart;
      return lastUnlockedLesson(i);
    }),
  );

  function navigate(scr: Screen, gi: number, fi: number) {
    screen = scr;
    currentGroupIdx = gi;
    currentFlatIdx = fi;
    history.pushState(null, "", getUrl(groups, scr, gi, fi));
  }

  function openGroup(groupIdx: number) {
    navigate("lessons", groupIdx, currentFlatIdx);
  }

  function startLesson(fi: number) {
    navigate("typing", findGroupIdx(groups, fi), fi);
  }

  let lastStats = $state<Stats | null>(null);

  function completeLesson(stats: Stats) {
    const id = flatLessons[currentFlatIdx].id;
    const prev = progress[id];
    const score = stats.wpm * (stats.accuracy ?? 1);
    const newRecord = {
      wpm: stats.wpm,
      elapsed: stats.elapsed,
      accuracy: stats.accuracy ?? 1,
      score,
    };
    progress[id] = !prev || score > (prev.score ?? 0) ? newRecord : prev;
    if (user) writeProgress(user.uid, progress);
    lastStats = stats;
    screen = "complete";
    // URL stays at the lesson URL (no pushState)
  }

  function nextLesson() {
    const next = currentFlatIdx + 1;
    if (next < flatLessons.length) {
      navigate("typing", findGroupIdx(groups, next), next);
    } else {
      navigate("groups", 0, 0);
    }
  }

  function goToLessons() {
    navigate("lessons", currentGroupIdx, currentFlatIdx);
  }

  function goToGroups() {
    navigate("groups", 0, 0);
  }

  $effect(() => {
    function onPopstate() {
      const s = parseUrl(groups, flatLessons, window.location.pathname);
      screen = s.screen;
      currentGroupIdx = s.groupIdx;
      currentFlatIdx = s.flatIdx;
    }
    window.addEventListener("popstate", onPopstate);
    return () => window.removeEventListener("popstate", onPopstate);
  });

</script>

{#if screen === "groups"}
  <GroupList
    {groups}
    {progress}
    onSelect={openGroup}
    bind:focused={groupFocused}
    {user}
    {authReady}
    onSignIn={signIn}
    onSignOut={handleSignOut}
  />
{:else if screen === "lessons"}
  <LessonList
    group={groups[currentGroupIdx]}
    groupIdx={currentGroupIdx}
    {progress}
    onSelect={startLesson}
    onBack={goToGroups}
    bind:focused={lessonFocused[currentGroupIdx]}
    {user}
    {authReady}
    onSignIn={signIn}
    onSignOut={handleSignOut}
  />
{:else if screen === "typing"}
  <TypingView
    lesson={flatLessons[currentFlatIdx]}
    onComplete={completeLesson}
    onBack={goToLessons}
    strictMode={false}
  />
{:else if screen === "complete"}
  <LessonComplete
    lesson={flatLessons[currentFlatIdx]}
    hasNext={currentFlatIdx < flatLessons.length - 1}
    stats={lastStats!}
    onNext={nextLesson}
    onBack={goToLessons}
  />
{/if}

<div class="mobile-message">
  <p>keebo needs a real keyboard ⌨️</p>
  <p>come back on a laptop or desktop</p>
</div>

<Footer />

<style>
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

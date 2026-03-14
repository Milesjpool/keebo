<script lang="ts">
  import type { Stats, Screen, Group } from "./services/types";
  import lessonsData from "./data/lessons.json";
  const rawGroups = lessonsData.groups;
  const source = lessonsData.source ?? undefined;
  import GroupList from "./screens/GroupList.svelte";
  import LessonList from "./screens/LessonList.svelte";
  import TypingView from "./screens/TypingView.svelte";
  import LessonComplete from "./screens/LessonComplete.svelte";
  import { auth, googleProvider, githubProvider } from "./services/firebase";
  import { onAuthStateChanged, signInWithPopup, signOut, linkWithPopup, linkWithCredential, OAuthCredential, GoogleAuthProvider, GithubAuthProvider, type User } from "firebase/auth";
  import LinkAccountModal from "./components/LinkAccountModal.svelte";
  import { getUrl, parseUrl, findGroupIdx } from "./services/router";
  import { loadProgress, saveProgress } from "./services/progress";
  import { subscribeToProgress, writeProgress } from "./services/sync";
  import Footer from "./components/Footer.svelte";

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
  let linkPrompt = $state<{ pendingCred: OAuthCredential; existingProvider: string } | null>(null);
  let linkError = $state<{ provider: string } | null>(null);

  $effect(() => {
    saveProgress(progress);
  });

  $effect(() => {
    const hide = () => document.body.classList.add('keyboard-nav')
    const show = () => document.body.classList.remove('keyboard-nav')
    window.addEventListener('keydown', hide)
    window.addEventListener('mousemove', show)
    return () => {
      window.removeEventListener('keydown', hide)
      window.removeEventListener('mousemove', show)
    }
  });

  $effect(() => {
    let unsubProgress: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      user = u;
      authReady = true;
      unsubProgress?.();
      if (u) {
        unsubProgress = subscribeToProgress(u.uid, () => progress, (m) => progress = m);
      }
    });
    return () => {
      unsubAuth();
      unsubProgress?.();
    };
  });

  async function signIn(provider: string) {
    const p = provider === "google" ? googleProvider : githubProvider;
    try {
      await signInWithPopup(auth, p);
    } catch (err: any) {
      if (err.code !== "auth/account-exists-with-different-credential") throw err;
      const pendingCred = provider === "github"
        ? GithubAuthProvider.credentialFromError(err)
        : GoogleAuthProvider.credentialFromError(err);
      if (pendingCred) {
        linkPrompt = {
          pendingCred,
          existingProvider: provider === "github" ? "google" : "github",
        };
      }
    }
  }

  async function confirmLink() {
    if (!linkPrompt) return;
    const { pendingCred, existingProvider } = linkPrompt;
    linkPrompt = null;
    const p = existingProvider === "google" ? googleProvider : githubProvider;
    const result = await signInWithPopup(auth, p);
    await linkWithCredential(result.user, pendingCred);
  }

  async function linkProvider(provider: string) {
    const p = provider === "google" ? googleProvider : githubProvider;
    try {
      await linkWithPopup(auth.currentUser!, p);
      user = null; // force Svelte to see a reference change (Firebase mutates User in-place)
      user = auth.currentUser;
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        linkError = { provider };
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        throw err;
      }
    }
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
    context={{ screen: 'groups', groupIdx: groupFocused }}
    {user}
    {authReady}
    onSignIn={signIn}
    onSignOut={handleSignOut}
    onLinkProvider={linkProvider}
    {source}
  />
{:else if screen === "lessons"}
  {@const lessonIdx = lessonFocused[currentGroupIdx]}
  {@const focusedLesson = lessonIdx >= 0 ? groups[currentGroupIdx].lessons[lessonIdx] : undefined}
  <LessonList
    group={groups[currentGroupIdx]}
    groupIdx={currentGroupIdx}
    {progress}
    onSelect={startLesson}
    onBack={goToGroups}
    bind:focused={lessonFocused[currentGroupIdx]}
    context={{
      screen: 'lessons',
      groupIdx: currentGroupIdx,
      flatIdx: focusedLesson?.flatIdx,
      lessonId: focusedLesson?.id,
    }}
    {user}
    {authReady}
    onSignIn={signIn}
    onSignOut={handleSignOut}
    onLinkProvider={linkProvider}
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

<LinkAccountModal
  open={!!linkPrompt}
  existingProvider={linkPrompt?.existingProvider ?? ''}
  onConfirm={confirmLink}
  onCancel={() => (linkPrompt = null)}
/>

<LinkAccountModal
  open={!!linkError}
  existingProvider={linkError?.provider ?? ''}
  errorMode={true}
  onConfirm={() => (linkError = null)}
  onCancel={() => (linkError = null)}
/>

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

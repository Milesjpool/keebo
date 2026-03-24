<script lang="ts">
  import type { Stats, Screen, Group, Difficulty } from "./services/types";
  import lessonsData from "./data/lessons.json";
  const rawGroups = lessonsData.groups;
  const source = lessonsData.source ?? undefined;
  import GroupList from "./screens/GroupList.svelte";
  import LessonList from "./screens/LessonList.svelte";
  import TypingView from "./screens/TypingView.svelte";
  import LessonComplete from "./screens/LessonComplete.svelte";
  import BrowseLayout from "./components/BrowseLayout.svelte";
  import { auth, googleProvider, githubProvider, db } from "./services/firebase";
  import { onAuthStateChanged, signInWithPopup, signOut, linkWithPopup, linkWithCredential, OAuthCredential, GoogleAuthProvider, GithubAuthProvider, deleteUser, type User } from "firebase/auth";
  import { deleteDoc, doc } from "firebase/firestore";
  import LinkAccountModal from "./components/LinkAccountModal.svelte";
  import { getUrl, parseUrl, findGroupIdx } from "./services/router";
  import { loadProgress, saveProgress } from "./services/progress";
  import { subscribeToProgress, writeProgress, writeDifficulty } from "./services/sync";
  import { loadDifficulty, saveDifficulty } from "./services/difficulty";
  import { calculateScore } from "./services/scoring";
  import { lastUnlockedGroup, lastUnlockedLesson } from "./services/unlock";
  import { setAuthContext } from "./services/auth-context";
  import Footer from "./components/Footer.svelte";
  import { ui } from "./services/ui.svelte.ts";

  $effect(() => {
    function onKeydown() { ui.keyboardNav = true; }
    function onMousemove() { ui.keyboardNav = false; }
    window.addEventListener('keydown', onKeydown, { capture: true });
    window.addEventListener('mousemove', onMousemove);
    return () => {
      window.removeEventListener('keydown', onKeydown, { capture: true });
      window.removeEventListener('mousemove', onMousemove);
    };
  });

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
  let difficulty = $state<Difficulty>(loadDifficulty());
  let user = $state<User | null>(null);
  let authReady = $state(false);
  let linkPrompt = $state<{ pendingCred: OAuthCredential; existingProvider: string } | null>(null);
  let linkError = $state<{ provider: string } | null>(null);

  $effect(() => {
    saveProgress(progress);
  });

  $effect(() => {
    saveDifficulty(difficulty);
  });


  $effect(() => {
    let unsubProgress: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      user = u;
      authReady = true;
      unsubProgress?.();
      if (u) {
        unsubProgress = subscribeToProgress(u.uid, () => progress, (m) => progress = m, (d) => difficulty = d);
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
    goToGroups();
  }

  function deleteProgress() {
    progress = {};
    saveProgress({});
    goToGroups();
  }

  async function deleteAccount() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const uid = currentUser.uid;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch {
      // Firestore doc may not exist; proceed with auth deletion
    }
    await deleteUser(currentUser);
    progress = {};
    saveProgress({});
    goToGroups();
  }

  function syncError(err: unknown) {
    console.warn('[keebo sync]', (err as Error)?.message ?? 'sync failed');
  }

  function isDone(lesson: { id: string }) {
    return lesson.id in progress;
  }

  setAuthContext({
    get user() { return user; },
    get authReady() { return authReady; },
    get difficulty() { return difficulty; },
    get difficultyLocked() { return screen === 'typing'; },
    onSignIn: signIn,
    onSignOut: handleSignOut,
    onLinkProvider: linkProvider,
    onDeleteAccount: deleteAccount,
    onDeleteProgress: deleteProgress,
    onDifficultyChange: (d) => { difficulty = d; if (user) writeDifficulty(user.uid, d).catch(syncError); },
  });

  let browseAuthFocusEl = $state<HTMLElement | null>(null);

  let groupFocused = $state(
    init.screen === "groups" ? lastUnlockedGroup(groups, progress) : init.groupIdx,
  );
  let lessonFocused = $state(
    groups.map((_, i) => {
      if (init.screen === "typing" && i === init.groupIdx)
        return init.flatIdx - groups[i].flatStart;
      return lastUnlockedLesson(groups[i], flatLessons, progress);
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
    const d = stats.difficulty ?? difficulty;
    const score = calculateScore(stats.wpm, stats.accuracy ?? 1, d);
    const newRecord = {
      wpm: stats.wpm,
      elapsed: stats.elapsed,
      accuracy: stats.accuracy ?? 1,
      score,
      difficulty: d,
    };
    progress[id] = !prev || score > (prev.score ?? 0) ? newRecord : prev;
    if (user) writeProgress(user.uid, progress).catch(syncError);
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

{#if screen === "groups" || screen === "lessons"}
  {@const browseContext = screen === "groups"
    ? { screen: 'groups', groupIdx: groupFocused }
    : (() => {
        const li = lessonFocused[currentGroupIdx];
        const fl = li >= 0 ? groups[currentGroupIdx].lessons[li] : undefined;
        return { screen: 'lessons', groupIdx: currentGroupIdx, flatIdx: fl?.flatIdx, lessonId: fl?.id };
      })()}
  <BrowseLayout
    context={browseContext}
    bind:authFocusEl={browseAuthFocusEl}
    onAuthDescend={() => { if (screen === 'groups') groupFocused = 0; else lessonFocused[currentGroupIdx] = -1 }}
    onAuthAscend={() => { if (screen === 'groups') groupFocused = -1; else lessonFocused[currentGroupIdx] = -2 }}
    onModalClose={() => { if (screen === 'groups') groupFocused = 0; else lessonFocused[currentGroupIdx] = 0 }}
  >
    {#if screen === "groups"}
      <GroupList
        {groups}
        {progress}
        onSelect={openGroup}
        bind:focused={groupFocused}
        authFocusEl={browseAuthFocusEl}
        {source}
      />
    {:else}
      <LessonList
        group={groups[currentGroupIdx]}
        groupIdx={currentGroupIdx}
        {progress}
        onSelect={startLesson}
        onBack={goToGroups}
        bind:focused={lessonFocused[currentGroupIdx]}
        authFocusEl={browseAuthFocusEl}
      />
    {/if}
  </BrowseLayout>
{:else if screen === "typing"}
  <TypingView
    lesson={flatLessons[currentFlatIdx]}
    onComplete={completeLesson}
    onBack={goToLessons}
  />
{:else if screen === "complete"}
  <LessonComplete
    lesson={flatLessons[currentFlatIdx]}
    hasNext={currentFlatIdx < flatLessons.length - 1}
    stats={lastStats!}
    {difficulty}
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

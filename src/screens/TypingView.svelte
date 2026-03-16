<script lang="ts">
  import type { Lesson, Stats } from "../services/types";
  import type { User } from "firebase/auth";
  import FingerIndicator from "../components/FingerIndicator.svelte";
  import AuthButton from "../components/AuthButton.svelte";
  import { formatTime } from "../services/utils";

  interface Props {
    lesson: Lesson;
    onComplete: (s: Stats) => void;
    onBack: () => void;
    strictMode?: boolean;
    user: User | null;
    authReady: boolean;
    onSignIn: (p: string) => Promise<void>;
    onSignOut: () => Promise<void>;
    onLinkProvider?: (p: string) => Promise<void>;
    onDeleteAccount?: () => Promise<void>;
    onDeleteProgress?: () => void;
  }
  let {
    lesson,
    onComplete,
    onBack,
    strictMode = false,
    user,
    authReady,
    onSignIn,
    onSignOut,
    onLinkProvider,
    onDeleteAccount,
    onDeleteProgress,
  }: Props = $props();

  let lineIndex = $state(0);
  let typed = $state("");
  let shaking = $state(false);
  let startTime = $state<number | null>(null);
  let elapsed = $state(0);
  let lineResults = $state<{ correct: number; total: number }[]>([]);
  const line = $derived(lesson.lines[lineIndex]);
  const total = $derived(lesson.lines.length);

  const accuracy = $derived(() => {
    const cc = lineResults.reduce((n, r) => n + r.correct, 0);
    const ct = lineResults.reduce((n, r) => n + r.total, 0);
    const cur = [...typed].filter((c, i) => c === line[i]).length;
    const tot = ct + typed.length;
    return tot === 0 ? 1 : (cc + cur) / tot;
  });

  $effect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      elapsed = Math.floor((Date.now() - startTime!) / 1000);
    }, 500);
    return () => clearInterval(id);
  });

  $effect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onBack();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (typed.length < line.length) return;
        const match = typed === line;
        if (!match) {
          if (!shaking) {
            shaking = true;
            setTimeout(() => {
              shaking = false;
            }, 400);
          }
          if (strictMode) return;
        }
        lineResults.push({
          correct: [...typed].filter((c, i) => c === line[i]).length,
          total: line.length,
        });
        if (lineIndex < total - 1) {
          lineIndex++;
          typed = "";
        } else {
          const secs = startTime ? (Date.now() - startTime) / 1000 : 1;
          const chars = lesson.lines.reduce((n, l) => n + l.length, 0);
          onComplete({
            wpm: Math.round(chars / 5 / (secs / 60)),
            elapsed: Math.round(secs),
            accuracy: accuracy(),
          });
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        typed = typed.slice(0, -1);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!startTime) startTime = Date.now();
        if (typed.length < line.length) typed += e.key;
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  const currentChar = $derived(
    typed.length < line.length ? line[typed.length] : "\n",
  );

  function charState(i: number) {
    if (i < typed.length) return typed[i] === line[i] ? "correct" : "error";
    if (i === typed.length) return "cursor";
    return "untyped";
  }
</script>

<div class="typing-view">
  <nav>
    <div class="nav-left">
      <button
        class="back-btn"
        onclick={onBack}
        onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
        onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        >← back</button
      >
    </div>
    <div class="nav-center">
      {#if startTime}
        <span class="timer">{formatTime(elapsed)}</span>
        <span class="sep">·</span>
        <span class="accuracy">{Math.round(accuracy() * 100)}%</span>
      {/if}
    </div>
    <div class="nav-right">
      <AuthButton
        {user}
        {authReady}
        {onSignIn}
        {onSignOut}
        {onLinkProvider}
        {onDeleteAccount}
        {onDeleteProgress}
        context={{
          screen: "typing",
          lessonId: lesson.id,
          flatIdx: lesson.flatIdx,
        }}
        avatarOnly
      />
    </div>
  </nav>

  <div class="progress-bar">
    {#each lesson.lines as _, i}
      <div class="segment">
        <div
          class="fill"
          style:width="{i < lineIndex
            ? 100
            : i === lineIndex
              ? (typed.length / line.length) * 100
              : 0}%"
        ></div>
      </div>
    {/each}
  </div>

  <main>
    <div class="line-wrap" class:shaking>
      <div class="line-display">
        {#each line.split("") as char, i}{@const state = charState(i)}<span
            class="char {state}"
            >{char === " "
              ? state === "correct" || state === "error"
                ? "·"
                : "\u00a0"
              : char}</span
          >{/each}<span
          class="char"
          class:cursor={typed.length === line.length}
          style:visibility={typed.length === line.length ? "visible" : "hidden"}
          >↵</span
        >
      </div>
    </div>
    {#if lesson.fingerHints !== false}<FingerIndicator
        char={currentChar}
      />{/if}
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
    padding: 0.75rem 2rem;
    border-bottom: 1px solid var(--border);
  }

  .nav-left {
    flex: 1;
  }

  .nav-center {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .nav-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .back-btn {
    font-size: 0.875rem;
    color: var(--muted);
    transition: color 0.15s;
  }

  .back-btn:focus {
    color: var(--text);
    outline: none;
  }

  .sep {
    color: var(--border);
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

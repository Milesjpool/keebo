<script lang="ts">
  import type { Lesson, Stats } from "../services/types";
  import type { User } from "firebase/auth";
  import FingerIndicator from "../components/FingerIndicator.svelte";
  import AuthButton from "../components/AuthButton.svelte";
  import { formatTime, calcScrollOffset } from "../services/utils";
  import { THRESHOLDS } from "../services/medals";

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
  let startTime = $state<number | null>(null);
  let lineStartTime = $state<number | null>(null);
  let elapsed = $state(0);
  let lineResults = $state<{ correct: number; total: number }[]>([]);
  let floatingScore = $state<{ wpm: number; accuracy: number; color: string } | null>(null);
  let floatingErrors = $state<{ id: number; char: string; left: number }[]>([]);
  let errorId = 0;

  function ragColor(score: number): string {
    if (score >= THRESHOLDS.gold) return 'var(--green)';
    if (score >= THRESHOLDS.silver) return 'var(--text)';
    return 'var(--error)';
  }
  const line = $derived(lesson.lines[lineIndex]);
  const total = $derived(lesson.lines.length);

  let wrapEl = $state<HTMLDivElement | null>(null);
  let charWidth = $state(0);
  let wrapWidth = $state(0);

  $effect(() => {
    // Re-measure when line changes or wrapEl mounts
    void line;
    if (!wrapEl) return;
    const span = wrapEl.querySelector('.char') as HTMLElement | null;
    charWidth = span?.offsetWidth || 0;
    const style = getComputedStyle(wrapEl);
    wrapWidth = wrapEl.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  });

  const scrollOffset = $derived(
    // +1 for the ↵ character at the end
    calcScrollOffset(typed.length, line.length + 1, charWidth, wrapWidth)
  );

  const lineWidthPx = $derived((line.length + 1) * charWidth);
  const overflowLeft = $derived(scrollOffset > 0);
  const overflowRight = $derived(
    wrapWidth > 0 && lineWidthPx > wrapWidth && scrollOffset < lineWidthPx - wrapWidth
  );

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
        if (!match && strictMode) return;

        const lineCorrect = [...typed].filter((c, i) => c === line[i]).length;
        const lineAcc = lineCorrect / line.length;
        const lineSecs = lineStartTime ? (Date.now() - lineStartTime) / 1000 : 1;
        const lineWpm = Math.round(line.length / 5 / (lineSecs / 60));
        const lineScore = lineWpm * lineAcc;

        // Floating score
        floatingScore = { wpm: lineWpm, accuracy: lineAcc, color: ragColor(lineScore) };
        setTimeout(() => { floatingScore = null; }, 1800);

        lineResults.push({ correct: lineCorrect, total: line.length });

        if (lineIndex < total - 1) {
          lineIndex++;
          typed = "";
          lineStartTime = Date.now();
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
        const now = Date.now();
        if (!startTime) startTime = now;
        if (!lineStartTime) lineStartTime = now;
        if (typed.length < line.length) {
          const idx = typed.length;
          typed += e.key;
          if (e.key !== line[idx]) {
            const thisId = errorId++;
            const left = idx * charWidth - scrollOffset;
            floatingErrors = [...floatingErrors, { id: thisId, char: e.key, left }];
            setTimeout(() => {
              floatingErrors = floatingErrors.filter(f => f.id !== thisId);
            }, 900);
          }
        }
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
      <div class="segment" class:active={i === lineIndex}>
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

  <main class:overflow-left={overflowLeft} class:overflow-right={overflowRight}>
    <div class="line-anchor">
      {#if floatingScore}
        <div class="floating-score" style:color={floatingScore.color}>
          <span class="floating-score-inner">
            {floatingScore.wpm} <span class="score-unit">wpm</span> · {Math.round(floatingScore.accuracy * 100)}%
          </span>
        </div>
      {/if}
      <div class="line-wrap" bind:this={wrapEl}>
        {#each floatingErrors as err (err.id)}
          <span class="floating-error" style:left="{err.left}px">{err.char}</span>
        {/each}
          <div class="line-display" style:transform="translateX(-{scrollOffset}px)">
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
    overflow-x: clip;
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

  .timer {
    min-width: 2.5rem;
    text-align: right;
  }

  .accuracy {
    min-width: 2.5rem;
    text-align: left;
  }

  .sep {
    font-weight: bold;
    color: var(--accent);
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 2rem 0;
    width: 100%;
    position: relative;
  }

  main::before,
  main::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 1;
  }

  main::before {
    left: 0;
    background: linear-gradient(to right, var(--bg), transparent);
  }

  main::after {
    right: 0;
    background: linear-gradient(to left, var(--bg), transparent);
  }

  main.overflow-left::before,
  main.overflow-right::after {
    opacity: 1;
  }

  .progress-bar {
    display: flex;
    gap: 2px;
    height: 3px;
    align-items: flex-start;
  }

  .segment {
    flex: 1;
    height: 100%;
    background: var(--border);
    overflow: hidden;
    transition: height 0.15s;
  }

  .segment.active {
    height: 5px;
  }

  .fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.05s linear;
  }

  .line-anchor {
    position: relative;
    max-width: 100%;
  }

  .line-wrap {
    position: relative;
    padding: 1rem 8rem;
    max-width: 100%;
  }

  .line-display {
    font-size: 1.75rem;
    letter-spacing: 0.05em;
    white-space: pre;
    line-height: 1;
    transition: transform 0.12s ease-out;
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

  .floating-error {
    position: absolute;
    top: 1rem;
    margin-left: 8rem;
    font-size: 1.75rem;
    letter-spacing: 0.05em;
    line-height: 1;
    color: var(--error);
    pointer-events: none;
    animation: error-float 0.8s ease-out forwards;
  }

  @keyframes error-float {
    0%   { opacity: 0.7; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-2rem); }
  }

  .floating-score {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.75rem;
    font-weight: bold;
    pointer-events: none;
    animation: float-rise 1.6s ease-out forwards;
    z-index: 2;
  }

  .score-unit {
    font-size: 0.6em;
    font-weight: normal;
    margin-left: -0.2em;
  }

  .floating-score-inner {
    display: block;
    animation: float-sway 1.6s ease-in-out forwards;
  }

  @keyframes float-rise {
    0%   { opacity: 0.65; transform: translate(-50%, -3rem); }
    100% { opacity: 0; transform: translate(-50%, -7rem); }
  }

  @keyframes float-sway {
    0%   { transform: translateX(0); }
    25%  { transform: translateX(2px); }
    75%  { transform: translateX(-2px); }
    100% { transform: translateX(0); }
  }
</style>

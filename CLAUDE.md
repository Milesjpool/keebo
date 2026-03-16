# keebo — agent instructions

Touch-typing SPA. Svelte 5 + Vite + TypeScript + Firebase. Run with bun.

## Commands
```
bun run dev      # dev server
bun run build    # production build (also copies dist/index.html → dist/404.html)
bun run test     # run tests (single run)
bun run test:watch  # run tests in watch mode
```
If `bun` isn't in PATH, it's at `~/.bun/bin/bun`.

## Stack
- Svelte 5 runes mode: `$state`, `$derived`, `$effect` (no legacy stores)
- TypeScript strict — shared types in `src/lib/types.ts`
- Vite 7

## Key decisions / invariants
- Lessons unlock sequentially; completing lesson N unlocks N+1
- Progress: `localStorage['keebo-progress']` = `{ [lessonUUID]: { wpm, elapsed } }` — presence = done, best WPM kept on retake
- Typing: backspace to correct; Enter advances only when typed === line exactly (shakes on mismatch)
- Spaces rendered as `\u00a0` in spans to preserve whitespace
- `--finger` CSS var for active-finger highlight (softer than `--accent` in dark mode)

## Navigation / focus model

**Single rule: DOM focus is the only focus.** Visual highlights come from `:focus` CSS only — never from `:hover` and never from a `class:focused` state variable.

### Keyboard-nav mode (`ui.keyboardNav`)
- Any `keydown` → `ui.keyboardNav = true`; any `mousemove` → `false`
- Setter in `src/services/ui.svelte.ts` syncs `body.keyboard-nav` class synchronously
- `body.keyboard-nav *` has `pointer-events: none !important` — suppresses all hover events globally
- In modals using `useKeydown({ stopAll: true })`, register a `ui.keyboardNav = true` capture listener *before* calling `useKeydown` so it fires before `stopImmediatePropagation`

### Mouse → focus
- `onmouseenter`: `el.focus()` — no keyboardNav guard needed (pointer-events handles it)
- `onmouseleave`: `el.blur()`
- Never set a JS state variable on hover — hover just moves DOM focus

### Arrow-key navigation in lists (GroupList, LessonList)
- `focused: number` integer tracks keyboard position; persisted in App.svelte via `bind:focused`
- Keyboard handlers update `focused` integer only
- A `$effect` translates `focused` → `el.focus()` on the corresponding button
- `onfocus` on each button syncs DOM focus back to `focused` (for resumption after hover/blur)
- Sentinel values: `-1` = back button (LessonList) or auth button (GroupList); `-2` = auth button (LessonList)
- `scrollIntoView` driven by `focused` changes (works for both keyboard and hover paths)

### Arrow-key navigation in modals
- Query `button:not(:disabled)` at call time via `querySelectorAll`; move with `btns[idx ± 1]?.focus()`
- Auto-focus first relevant element on open (`setTimeout(() => el?.focus(), 0)`)
- `Escape` closes and blurs; `Enter`/`Cmd+Enter` submits where applicable

### No `:hover` CSS anywhere
- Every `:hover` rule must be replaced with `:focus`
- Hover visuals work because `onmouseenter` → `.focus()` → `:focus` CSS applies

## Testing
- **Vitest** + **jsdom** + **@testing-library/svelte** — config in `vitest.config.ts`
- Co-located test files: `<module>.test.ts` next to source
- Global setup in `src/test/setup.ts` (localStorage mock, Firebase mock, jest-dom matchers)
- Shared fixtures in `src/test/fixtures.ts`
- vitest globals (`describe`, `it`, `expect`, `vi`) — no imports needed
- Mock Firebase: always mock `./firebase` and `firebase/firestore` — never import real Firebase in tests
- Mock Svelte components with `vi.mock('path', () => ({ default: function($$anchor, $$props) {} }))`
- No snapshot tests — test behavior, not markup
- One behavior per `it()` block; name tests as sentences
- **When modifying source, update or add corresponding tests**
- CI runs tests before build — all tests must pass for deploy

## Conventions
- Svelte runes only — no `$:`, no `writable()`
- Inline event handlers → named functions when non-trivial
- CSS lives in `<style>` blocks or `app.css`; no external CSS framework
- Commits: conventional-commits style (`feat:`, `fix:`, `refactor:`, etc.)
- Git commit messages: inline multi-line string, not heredoc `<<EOF`

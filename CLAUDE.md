# keebo — agent instructions

Touch-typing SPA. Svelte 5 + Vite + TypeScript + Firebase. Run with bun.

## Commands
```
bun run dev      # dev server
bun run build    # production build (also copies dist/index.html → dist/404.html)
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

## Conventions
- Svelte runes only — no `$:`, no `writable()`
- Inline event handlers → named functions when non-trivial
- CSS lives in `<style>` blocks or `app.css`; no external CSS framework
- Commits: conventional-commits style (`feat:`, `fix:`, `refactor:`, etc.)
- Git commit messages: inline multi-line string, not heredoc `<<EOF`

<script lang="ts">
  import type { Snippet } from 'svelte'
  import AuthButton from './AuthButton.svelte'
  import TitleType from './TitleType.svelte'

  interface Props {
    context: { screen: string; groupIdx?: number; flatIdx?: number; lessonId?: string }
    authFocusEl?: HTMLElement | null
    onAuthDescend?: () => void
    onAuthAscend?: () => void
    onModalClose?: () => void
    children: Snippet
  }
  let {
    context,
    authFocusEl = $bindable<HTMLElement | null>(null),
    onAuthDescend,
    onAuthAscend,
    onModalClose,
    children,
  }: Props = $props()

  const HERO_KEY = 'keebo:hero-shown'
  let hero = $state(!sessionStorage.getItem(HERO_KEY))
  let layoutEl = $state<HTMLDivElement | null>(null)

  function onChildScroll(e: Event) {
    const el = e.target as HTMLElement
    if (hero && el.scrollTop > 0) {
      hero = false
      sessionStorage.setItem(HERO_KEY, '1')
    }
  }

  // Listen for scroll events from child lists (scroll doesn't bubble, so use capture)
  $effect(() => {
    if (!layoutEl) return
    layoutEl.addEventListener('scroll', onChildScroll, true)
    return () => layoutEl!.removeEventListener('scroll', onChildScroll, true)
  })
</script>

<div class="browse-layout" class:hero bind:this={layoutEl}>
  <header>
    <div class="header-left">
      <TitleType />
      <p class="subtitle">touch typing, step by step</p>
    </div>
    <AuthButton {context} bind:focusEl={authFocusEl} onDescend={onAuthDescend} onAscend={onAuthAscend} {onModalClose} />
  </header>

  {@render children()}
</div>

<style>
  .browse-layout {
    max-width: 600px;
    margin: 0 auto;
    padding: 4rem 2rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: padding-top 0.5s ease;
  }

  .browse-layout.hero {
    padding-top: 15vh;
  }

  header {
    margin-bottom: 3rem;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    transition: margin-bottom 0.5s ease;
  }

  .hero header {
    margin-bottom: 5rem;
  }

  .header-left {
    display: flex;
    flex-direction: column;
  }

  :global(.avatar) {
    transition: transform 0.5s ease;
  }

  .hero :global(.avatar) {
    transform: translateY(-0.5rem);
  }

  .subtitle {
    color: var(--muted);
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }

</style>

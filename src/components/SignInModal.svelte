<script lang="ts">
  import { useKeydown } from '../services/utils'
  import Modal from './Modal.svelte'
  import ProviderIcon from './ProviderIcon.svelte'

  interface Props {
    open: boolean
    onSignIn: (p: string) => Promise<void>
    onClose: () => void
  }
  let { open, onSignIn, onClose }: Props = $props()

  let modalEl = $state<HTMLDivElement | null>(null)
  let closeBtnEl = $state<HTMLButtonElement | null>(null)

  function modalButtons() {
    return Array.from(modalEl?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
  }

  function handleSignIn(provider: string) {
    onClose()
    onSignIn(provider)
  }

  $effect(() => {
    if (!open) return
    setTimeout(() => closeBtnEl?.focus(), 0)
    const cleanup = useKeydown(
      {
        Escape: () => onClose(),
        ArrowDown: (e) => {
          e.preventDefault()
          const btns = modalButtons()
          btns[btns.indexOf(document.activeElement as HTMLButtonElement) + 1]?.focus()
        },
        ArrowUp: (e) => {
          e.preventDefault()
          const btns = modalButtons()
          const i = btns.indexOf(document.activeElement as HTMLButtonElement)
          if (i > 0) btns[i - 1]?.focus()
        },
      },
      { capture: true, stopAll: true },
    )
    return () => cleanup()
  })
</script>

{#if open}
  <Modal title="sign in" labelId="signin-title" {onClose} bind:closeBtnEl bind:modalEl>
    <section>
      <button class="provider-row" onclick={() => handleSignIn('google')}>
        <ProviderIcon provider="google" />
        <span class="provider-name">Google</span>
        <span class="provider-status">
          <svg class="plus-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
      </button>
      <button class="provider-row" onclick={() => handleSignIn('github')}>
        <ProviderIcon provider="github" />
        <span class="provider-name">GitHub</span>
        <span class="provider-status">
          <svg class="plus-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
      </button>
    </section>
  </Modal>
{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .provider-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    background: none;
    border: none;
    text-align: left;
    transition: background 0.1s;
  }

  .provider-row:focus {
    background: var(--surface-hover);
    outline: none;
  }

  .provider-row:focus :global(.provider-icon) {
    color: var(--text);
  }

  .provider-name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .provider-row:focus .provider-name {
    color: var(--text);
  }

  .provider-status {
    display: flex;
    align-items: center;
  }

  .plus-icon {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: var(--muted);
  }

  .provider-row:focus .plus-icon {
    color: var(--text);
  }
</style>

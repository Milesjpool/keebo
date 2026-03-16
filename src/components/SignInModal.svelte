<script lang="ts">
  import { useKeydown } from '../services/utils'
  import Modal from './Modal.svelte'
  import ProviderIcon from './ProviderIcon.svelte'
  import Icon from './Icon.svelte'
  import iconPlus from '../assets/icon-plus.svg?raw'

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

  function moveDown(e: KeyboardEvent) {
    e.preventDefault()
    const btns = modalButtons()
    btns[btns.indexOf(document.activeElement as HTMLButtonElement) + 1]?.focus()
  }

  function moveUp(e: KeyboardEvent) {
    e.preventDefault()
    const btns = modalButtons()
    const i = btns.indexOf(document.activeElement as HTMLButtonElement)
    if (i > 0) btns[i - 1]?.focus()
  }

  $effect(() => {
    if (!open) return
    setTimeout(() => closeBtnEl?.focus(), 0)
    const cleanup = useKeydown(
      {
        Escape: () => onClose(),
        ArrowDown: moveDown,
        s: moveDown,
        ArrowUp: moveUp,
        w: moveUp,
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
          <Icon svg={iconPlus} class="plus-icon" />
        </span>
      </button>
      <button class="provider-row" onclick={() => handleSignIn('github')}>
        <ProviderIcon provider="github" />
        <span class="provider-name">GitHub</span>
        <span class="provider-status">
          <Icon svg={iconPlus} class="plus-icon" />
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

  :global(.plus-icon) {
    display: flex;
    color: var(--muted);
  }

  :global(.plus-icon svg) {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
  }

  .provider-row:focus :global(.plus-icon) {
    color: var(--text);
  }
</style>

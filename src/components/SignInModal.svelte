<script lang="ts">
  import { useKeydown } from '../services/utils'
  import Modal from './Modal.svelte'

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
        <svg class="provider-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z"/></svg>
        <span class="provider-name">Google</span>
        <span class="provider-status">
          <svg class="plus-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
      </button>
      <button class="provider-row" onclick={() => handleSignIn('github')}>
        <svg class="provider-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)"/></svg>
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

  .provider-row:focus .provider-icon {
    color: var(--text);
  }

  .provider-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--muted);
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

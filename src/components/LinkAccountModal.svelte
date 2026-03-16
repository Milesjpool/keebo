<script lang="ts">
  import { useKeydown } from '../services/utils'
  import Modal from './Modal.svelte'

  interface Props {
    open: boolean;
    existingProvider: string; // "google" | "github"
    errorMode?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  let { open, existingProvider, errorMode = false, onConfirm, onCancel }: Props = $props()

  const label = $derived(existingProvider === 'google' ? 'Google' : 'GitHub')

  let dismissBtnEl = $state<HTMLButtonElement | null>(null)
  let confirmBtnEl = $state<HTMLButtonElement | null>(null)

  $effect(() => {
    if (!open) return
    setTimeout(() => (errorMode ? dismissBtnEl : confirmBtnEl)?.focus(), 0)
    return useKeydown({ Escape: () => onCancel() }, { capture: true, stopAll: true })
  })
</script>

{#if open}
  <Modal
    title={errorMode ? 'already linked' : 'link accounts'}
    labelId="link-modal-title"
    onClose={onCancel}
    style="--modal-gap: 1rem"
  >
    {#if errorMode}
      <p>This {label} account is already linked to another keebo account.</p>
      <div class="actions">
        <button class="btn-secondary" bind:this={dismissBtnEl} onclick={onCancel}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        >dismiss</button>
      </div>
    {:else}
      <p>An account with this email already exists. Sign in with {label} to link your accounts.</p>
      <div class="actions">
        <button class="btn-primary" bind:this={confirmBtnEl} onclick={onConfirm}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        >sign in with {label}</button>
        <button class="btn-secondary" onclick={onCancel}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        >cancel</button>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  p {
    font-size: 0.875rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-bottom: 0.5rem;
  }
</style>

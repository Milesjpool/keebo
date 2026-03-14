<script lang="ts">
  import { useKeydown } from '../services/utils'

  interface Props {
    open: boolean;
    existingProvider: string; // "google" | "github"
    errorMode?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  let { open, existingProvider, errorMode = false, onConfirm, onCancel }: Props = $props()

  const label = $derived(existingProvider === 'google' ? 'Google' : 'GitHub')

  $effect(() => {
    if (!open) return
    return useKeydown({ Escape: () => onCancel() }, { capture: true, stopAll: true })
  })
</script>

{#if open}
  <div class="backdrop" onclick={onCancel} role="presentation">
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      {#if errorMode}
        <h2>already linked</h2>
        <p>This {label} account is already linked to another keebo account.</p>
        <div class="actions">
          <button class="btn-secondary" onclick={onCancel}>dismiss</button>
        </div>
      {:else}
        <h2>link accounts</h2>
        <p>An account with this email already exists. Sign in with {label} to link your accounts.</p>
        <div class="actions">
          <button class="btn-primary" onclick={onConfirm}>sign in with {label}</button>
          <button class="btn-secondary" onclick={onCancel}>cancel</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    max-width: 360px;
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--correct);
    margin: 0;
  }

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
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.6rem 1.25rem;
  }
</style>

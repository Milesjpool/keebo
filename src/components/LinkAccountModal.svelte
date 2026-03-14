<script lang="ts">
  import { useKeydown } from '../services/utils'

  interface Props {
    open: boolean;
    existingProvider: string; // "google" | "github"
    onConfirm: () => void;
    onCancel: () => void;
  }
  let { open, existingProvider, onConfirm, onCancel }: Props = $props()

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
      <h2>link accounts</h2>
      <p>An account with this email already exists. Sign in with {existingProvider === 'google' ? 'Google' : 'GitHub'} to link your accounts.</p>
      <div class="actions">
        <button class="btn-primary" onclick={onConfirm}>sign in with {existingProvider === 'google' ? 'Google' : 'GitHub'}</button>
        <button class="btn-secondary" onclick={onCancel}>cancel</button>
      </div>
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
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.6rem 1.25rem;
  }
</style>

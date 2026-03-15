<script lang="ts">
  interface Props {
    label: string;
    warningText: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
    disabled?: boolean;
    loadingLabel?: string;
    open?: boolean;
    cancelEl?: HTMLButtonElement | null;
    confirmEl?: HTMLButtonElement | null;
  }

  let {
    label,
    warningText,
    confirmLabel,
    onConfirm,
    disabled = false,
    loadingLabel,
    open = $bindable(false),
    cancelEl = $bindable<HTMLButtonElement | null>(null),
    confirmEl = $bindable<HTMLButtonElement | null>(null),
  }: Props = $props();

  let triggerBtnEl = $state<HTMLButtonElement | null>(null);
  let cancelBtnEl = $state<HTMLButtonElement | null>(null);
  let confirmBtnEl = $state<HTMLButtonElement | null>(null);

  $effect(() => { cancelEl = cancelBtnEl; });
  $effect(() => { confirmEl = confirmBtnEl; });

  let prevOpen = false;
  $effect(() => {
    if (open && !prevOpen) {
      prevOpen = true;
      setTimeout(() => cancelBtnEl?.focus(), 0);
    } else if (!open && prevOpen) {
      prevOpen = false;
      setTimeout(() => triggerBtnEl?.focus(), 0);
    }
  });
</script>

<button
  class="btn-delete"
  class:open
  bind:this={triggerBtnEl}
  onclick={() => (open = !open)}
  onmouseenter={() => triggerBtnEl?.focus()}
  onmouseleave={() => triggerBtnEl?.blur()}
>{label}</button>

{#if open}
  <div class="confirm-section">
    <p class="warning-text">{warningText}</p>
    <div class="confirm-actions">
      <button
        class="btn-secondary"
        bind:this={cancelBtnEl}
        onclick={() => (open = false)}
        onmouseenter={() => cancelBtnEl?.focus()}
        onmouseleave={() => cancelBtnEl?.blur()}
      >cancel</button>
      <button
        class="btn-danger"
        bind:this={confirmBtnEl}
        onclick={onConfirm}
        {disabled}
        onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
        onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
      >{disabled && loadingLabel ? loadingLabel : confirmLabel}</button>
    </div>
  </div>
{/if}

<style>
  .btn-delete {
    font-size: 0.875rem;
    color: var(--error);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.6rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    text-align: left;
    transition: background 0.1s, opacity 0.1s;
  }

  .btn-delete:focus {
    background: var(--surface-hover);
    outline: none;
  }

  .btn-delete.open {
    background: var(--surface-hover);
  }

  .confirm-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.35rem 2rem 0.6rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    background: var(--surface-hover);
    animation: expand-in 0.12s ease;
  }

  @keyframes expand-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .warning-text {
    font-size: 0.8rem;
    color: var(--error);
    margin: 0;
    line-height: 1.4;
  }

  .confirm-actions {
    display: flex;
    gap: 0.75rem;
    align-self: flex-end;
  }

  .btn-danger {
    padding: 0.6rem 1.25rem;
    font-size: 0.875rem;
    font-family: inherit;
    background: none;
    border: 1px solid var(--error);
    border-radius: 6px;
    color: var(--error);
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
  }

  .btn-danger:focus:not(:disabled) {
    background: var(--error);
    color: var(--cursor-text);
    outline: none;
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

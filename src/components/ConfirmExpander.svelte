<script lang="ts">
  import { slide } from 'svelte/transition';
  interface Props {
    label: string;
    warningText: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
    disabled?: boolean;
    loadingLabel?: string;
    open?: boolean;
    triggerEl?: HTMLElement | null;
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
    triggerEl = $bindable<HTMLElement | null>(null),
    cancelEl = $bindable<HTMLButtonElement | null>(null),
    confirmEl = $bindable<HTMLButtonElement | null>(null),
  }: Props = $props();

  let wrapperEl = $state<HTMLDivElement | null>(null);
  let cancelBtnEl = $state<HTMLButtonElement | null>(null);
  let confirmBtnEl = $state<HTMLButtonElement | null>(null);

  $effect(() => { triggerEl = wrapperEl; });
  $effect(() => { cancelEl = cancelBtnEl; });
  $effect(() => { confirmEl = confirmBtnEl; });

  let returnFocusOnCollapse = true;

  let prevOpen = false;
  $effect(() => {
    if (open && !prevOpen) {
      prevOpen = true;
      setTimeout(() => cancelBtnEl?.focus(), 0);
    } else if (!open && prevOpen) {
      prevOpen = false;
      if (returnFocusOnCollapse) {
        setTimeout(() => wrapperEl?.focus(), 0);
      }
      returnFocusOnCollapse = true;
    }
  });

  function collapseFromFocusOut() {
    if (!open) return;
    returnFocusOnCollapse = false;
    open = false;
  }
</script>

<div
  class="expander-wrap"
  class:open
  tabindex="-1"
  data-keynav-item
  bind:this={wrapperEl}
  onclick={() => (open = !open)}
  onmouseenter={() => { if (!wrapperEl?.contains(document.activeElement)) wrapperEl?.focus(); }}
  onmouseleave={() => { if (!open && document.activeElement === wrapperEl) wrapperEl?.blur(); }}
  onfocusout={() => { setTimeout(() => { if (!wrapperEl?.contains(document.activeElement)) collapseFromFocusOut(); }, 0); }}
>
  <span class="expand-label">{label}</span>

  {#if open}
    <div class="confirm-section" transition:slide={{ duration: 150 }}>
      <p class="warning-text">{warningText}</p>
      <div class="confirm-actions">
        <button
          class="btn-secondary"
          data-no-keynav
          bind:this={cancelBtnEl}
          onclick={(e) => { e.stopPropagation(); open = false; }}
          onmouseenter={() => cancelBtnEl?.focus()}
          onmouseleave={() => wrapperEl?.focus()}
        >cancel</button>
        <button
          class="btn-danger"
          data-no-keynav
          bind:this={confirmBtnEl}
          onclick={(e) => { e.stopPropagation(); onConfirm(); }}
          {disabled}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={() => wrapperEl?.focus()}
        >{disabled && loadingLabel ? loadingLabel : confirmLabel}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .expander-wrap {
    font-size: 0.875rem;
    padding: 0.6rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    cursor: pointer;
    outline: none;
    transition: background 0.1s;
  }

  .expander-wrap:focus,
  .expander-wrap.open {
    background: var(--surface-hover);
  }

  .expand-label {
    color: var(--error);
  }

  .confirm-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.35rem 0 0.6rem;
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

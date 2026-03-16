<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    labelId: string
    onClose: () => void
    children: Snippet
    closeBtnEl?: HTMLButtonElement | null
    modalEl?: HTMLDivElement | null
    style?: string
    closeable?: boolean
  }
  let { title, labelId, onClose, children, closeBtnEl = $bindable(null), modalEl = $bindable(null), style, closeable = true }: Props = $props()
</script>

<div class="backdrop" onclick={onClose} role="presentation" {style}>
  <div
    class="modal"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    onmouseover={(e) => { if (!(document.activeElement instanceof HTMLInputElement)) (e.target as Element).closest('button:not(:disabled)')?.focus() }}
    onmouseout={(e) => { (e.target as Element).closest('button:not(:disabled)')?.blur() }}
    onfocus={() => {}}
    onblur={() => {}}
    bind:this={modalEl}
    role="dialog"
    aria-labelledby={labelId}
    tabindex="-1"
  >
    {#if closeable}
      <button class="modal-header" id={labelId} bind:this={closeBtnEl} onclick={onClose}>
        <span class="modal-title">{title}</span>
        <span class="btn-close">×</span>
      </button>
    {:else}
      <div class="modal-header modal-header-static" id={labelId}>
        <span class="modal-title">{title}</span>
      </div>
    {/if}
    {@render children()}
  </div>
</div>

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
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    max-width: var(--modal-max-width, 360px);
    width: 100%;
    padding: 2rem 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: var(--modal-gap, 1.5rem);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    margin-top: -2rem;
    padding: 0.75rem 2rem;
    margin-bottom: calc(-1 * (var(--modal-gap, 1.5rem) - 0.5rem));
    background: none;
    font-family: inherit;
    border: none;
    cursor: pointer;
    outline: none;
    transition: background 0.1s;
  }

  .modal-header:focus {
    background: var(--surface-hover);
  }

  .modal-header-static {
    cursor: default;
    pointer-events: none;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--correct);
  }

  .btn-close {
    font-size: 1.1rem;
    color: var(--muted);
    line-height: 1;
  }
</style>

<script lang="ts">
  import type { User } from "firebase/auth";
  import { submitFeedback } from "../services/feedback";
  import { useKeydown } from "../services/utils";

  interface Props {
    open: boolean;
    onClose: () => void;
    context?: {
      screen?: string;
      lessonId?: string;
      groupIdx?: number;
      flatIdx?: number;
    };
    user: User | null;
  }
  let { open, onClose, context = {}, user }: Props = $props();

  let text = $state("");
  let email = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let textareaEl = $state<HTMLTextAreaElement | null>(null);

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      error = "Please enter your feedback.";
      return;
    }
    if (trimmed.length > 2000) {
      error = "Feedback must be 2000 characters or less.";
      return;
    }
    error = null;
    loading = true;
    submitFeedback({
      text: trimmed,
      userId: user?.uid,
      email: user?.email ?? (email.trim() || undefined),
      screen: context?.screen,
      lessonId: context?.lessonId,
      groupIdx: context?.groupIdx,
      flatIdx: context?.flatIdx,
    })
      .then(() => {
        success = true;
        text = "";
        email = "";
        setTimeout(() => {
          success = false;
          onClose();
        }, 1500);
      })
      .catch((err) => {
        error = err?.message ?? "Something went wrong. Please try again.";
      })
      .finally(() => {
        loading = false;
      });
  }

  function handleClose() {
    if (!loading) onClose();
  }

  $effect(() => {
    if (!open) return;
    setTimeout(() => textareaEl?.focus(), 0);
    const cleanup = useKeydown(
      {
        Escape: () => handleClose(),
        Enter: (e) => {
          if (e.metaKey || e.ctrlKey) handleSubmit(e);
        },
      },
      { capture: true, stopAll: true },
    );
    return () => cleanup();
  });
</script>

{#if open}
  <div class="backdrop" onclick={handleClose} role="presentation">
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-labelledby="feedback-title"
      tabindex="-1"
    >
      {#if success}
        <p class="success">thanks for your feedback</p>
      {:else}
        <button
          class="modal-header"
          id="feedback-title"
          onclick={handleClose}
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
        >
          <span class="modal-title">feedback</span>
          <span class="btn-close">×</span>
        </button>
        <form onsubmit={handleSubmit}>
          <textarea
            bind:value={text}
            bind:this={textareaEl}
            placeholder="share your feedback…"
            rows="4"
            maxlength="2000"
            disabled={loading}
            aria-label="Feedback"
          ></textarea>
          {#if !user}
            <input
              type="email"
              bind:value={email}
              placeholder="email (optional)"
              disabled={loading}
              aria-label="Email (optional)"
            />
          {/if}
          {#if error}
            <p class="error">{error}</p>
          {/if}
          <div class="actions">
            <button
              type="submit"
              class="btn-primary"
              disabled={loading}
              onmouseenter={(e) =>
                (e.currentTarget as HTMLButtonElement).focus()}
              onmouseleave={(e) =>
                (e.currentTarget as HTMLButtonElement).blur()}
            >
              {loading ? "sending…" : "send"}
            </button>
          </div>
        </form>
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
    max-width: 380px;
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    margin-top: -2rem;
    padding: 0.75rem 2rem;
    margin-bottom: -0.5rem;
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

  .success {
    font-size: 1rem;
    color: var(--correct);
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  textarea,
  input {
    font-family: inherit;
    font-size: 0.875rem;
    padding: 0.6rem 0.75rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    resize: vertical;
  }

  textarea::placeholder,
  input::placeholder {
    color: var(--muted);
  }

  textarea:focus,
  input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .error {
    font-size: 0.8rem;
    color: var(--error);
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.25rem;
  }

  .btn-primary {
    padding: 0.6rem 1.25rem;
    background: none;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 6px;
    font-size: 0.875rem;
    font-family: inherit;
    transition:
      background 0.1s,
      color 0.1s;
    outline: none;
  }

  .btn-primary:focus:not(:disabled) {
    background: var(--accent);
    color: var(--cursor-text);
    opacity: 1;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

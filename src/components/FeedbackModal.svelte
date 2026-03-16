<script lang="ts">
  import type { User } from "firebase/auth";
  import { submitFeedback } from "../services/feedback";
  import { useKeydown } from "../services/utils";
  import Modal from "./Modal.svelte";

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
  let textareaRowEl = $state<HTMLDivElement | null>(null);
  let emailInputEl = $state<HTMLInputElement | null>(null);
  let emailRowEl = $state<HTMLDivElement | null>(null);
  let submitBtnEl = $state<HTMLButtonElement | null>(null);
  let closeBtnEl = $state<HTMLButtonElement | null>(null);

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
        ArrowDown: (e) => {
          const active = document.activeElement;
          if (active === document.body || !active) {
            e.preventDefault();
            closeBtnEl?.focus();
          } else if (active === closeBtnEl) {
            e.preventDefault();
            textareaEl?.focus();
          } else if (active === textareaRowEl) {
            e.preventDefault();
            textareaEl?.focus();
          } else if (active === emailRowEl) {
            e.preventDefault();
            emailInputEl?.focus();
          } else if (active === emailInputEl) {
            e.preventDefault();
            submitBtnEl?.focus();
          } else if (
            active === textareaEl &&
            textareaEl.selectionStart === textareaEl.value.length &&
            textareaEl.selectionEnd === textareaEl.value.length
          ) {
            e.preventDefault();
            (emailInputEl ?? submitBtnEl)?.focus();
          }
        },
        ArrowUp: (e) => {
          const active = document.activeElement;
          if (active === document.body || !active) {
            e.preventDefault();
            submitBtnEl?.focus();
          } else if (active === textareaRowEl) {
            e.preventDefault();
            closeBtnEl?.focus();
          } else if (active === emailRowEl || active === emailInputEl) {
            e.preventDefault();
            textareaEl?.focus();
          } else if (active === submitBtnEl) {
            e.preventDefault();
            (emailInputEl ?? textareaEl)?.focus();
          } else if (
            active === textareaEl &&
            textareaEl.selectionStart === 0 &&
            textareaEl.selectionEnd === 0
          ) {
            e.preventDefault();
            closeBtnEl?.focus();
          }
        },
      },
      { capture: true, stopAll: true },
    );
    return () => cleanup();
  });
</script>

{#if open}
  <Modal title="feedback" labelId="feedback-title" onClose={handleClose} bind:closeBtnEl>
    {#if success}
      <p class="success">thanks for your feedback</p>
    {:else}
      <form onsubmit={handleSubmit}>
        <div class="field-row" tabindex="-1" bind:this={textareaRowEl}
          onmouseenter={() => { if (document.activeElement !== textareaEl) textareaRowEl?.focus() }}>
          <textarea
            bind:value={text}
            bind:this={textareaEl}
            placeholder="share your feedback…"
            rows="4"
            maxlength="2000"
            disabled={loading}
            aria-label="Feedback"
          ></textarea>
        </div>
        {#if !user}
          <div class="field-row" tabindex="-1" bind:this={emailRowEl}
            onmouseenter={() => { if (document.activeElement !== emailInputEl) emailRowEl?.focus() }}>
            <input
              type="email"
              bind:value={email}
              bind:this={emailInputEl}
              placeholder="email (optional)"
              disabled={loading}
              aria-label="Email (optional)"
            />
          </div>
        {/if}
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <div class="actions">
          <button
            type="submit"
            class="btn-primary"
            bind:this={submitBtnEl}
            disabled={loading}
            onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).focus()}
            onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).blur()}
          >
            {loading ? "sending…" : "send"}
          </button>
        </div>
      </form>
    {/if}
  </Modal>
{/if}

<style>
  .success {
    font-size: 1rem;
    color: var(--correct);
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .field-row {
    width: calc(100% + 4rem);
    margin-left: -2rem;
    padding: 0.5rem 2rem;
    transition: background 0.1s;
    outline: none;
  }

  .field-row:focus-within {
    background: var(--surface-hover);
  }

  textarea,
  input[type="email"] {
    width: 100%;
    font-family: inherit;
    font-size: 0.875rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    outline: none;
    padding: 0.2rem 0;
    display: block;
  }

  textarea {
    resize: none;
  }

  textarea::placeholder,
  input[type="email"]::placeholder {
    color: var(--muted);
  }

  textarea:focus,
  input[type="email"]:focus {
    border-bottom-color: var(--accent);
  }

  textarea::selection,
  input[type="email"]::selection {
    background: var(--accent);
    color: var(--cursor-text);
  }

  .error {
    font-size: 0.8rem;
    color: var(--error);
    margin: 0;
    padding: 0.25rem 0 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
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

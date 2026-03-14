<script lang="ts">
  import type { User } from "firebase/auth";
  import { getAnonName } from "./anonNames";
  import FeedbackModal from "./FeedbackModal.svelte";

  interface FeedbackContext {
    screen?: string;
    lessonId?: string;
    groupIdx?: number;
    flatIdx?: number;
  }

  interface Props {
    user: User | null;
    authReady: boolean;
    context?: FeedbackContext;
    onSignIn: (p: string) => Promise<void>;
    onSignOut: () => Promise<void>;
  }
  let { user, authReady, context, onSignIn, onSignOut }: Props = $props();

  let open = $state(false);
  let feedbackOpen = $state(false);
  let anonName = $state(getAnonName());

  function toggle() {
    open = !open;
  }

  function signInWith(provider: string) {
    open = false;
    onSignIn(provider);
  }

  function openFeedback() {
    open = false;
    feedbackOpen = true;
  }


  function onDocClick(e: MouseEvent) {
    if (!(e.target as Element).closest(".auth-wrap")) open = false;
  }

  $effect(() => {
    if (open) {
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  });
</script>

<div class="auth-wrap">
  <button
    class="auth-btn"
    onclick={toggle}
    aria-label={"account menu"}
    disabled={!authReady}
  >
    <div class="avatar">
      {#if authReady}
        {#if user?.photoURL}
          <img src={user.photoURL} alt="" referrerpolicy="no-referrer" />
        {:else}
          <svg
            class="anon-avatar"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 21a7 7 0 0 1 14 0" />
          </svg>
        {/if}
      {/if}
    </div>

    {#if !authReady}
      <span class="auth-label">█████ ████</span>
    {:else if user}
      <span class="auth-label"
        >{user.displayName?.toLowerCase() ?? user.email}</span
      >
    {:else}
      <span class="auth-label">{anonName}</span>
    {/if}
  </button>

  {#if open}
    <div class="dropdown">
      {#if user}
        <span class="dropdown-label">my account</span>
        <button
          onclick={() => {
            open = false;
            onSignOut();
          }}>sign out</button
        >
      {:else}
        <span class="dropdown-label">sign in</span>
        <button onclick={() => signInWith("google")}>Google</button>
        <button onclick={() => signInWith("github")}>GitHub</button>
      {/if}
      <button class="dropdown-feedback" onclick={openFeedback}>feedback</button>
    </div>
  {/if}
</div>

<FeedbackModal
  open={feedbackOpen}
  onClose={() => (feedbackOpen = false)}
  {context}
  {user}
/>

<style>
  .auth-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .auth-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    font-size: inherit;
    color: var(--muted);
    transition: color 0.15s;
  }

  .auth-btn:hover {
    color: var(--text);
  }

  .auth-label {
    font-size: 0.875rem;
    margin-top: 0.25rem;
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar img {
    width: 120%;
    height: 120%;
    object-fit: cover;
  }

  .anon-avatar {
    width: 1.125rem;
    height: 1.125rem;
    opacity: 0.7;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    min-width: 8rem;
    z-index: 10;
    overflow: hidden;
  }


  .dropdown-label {
    display: block;
    padding: 0.6rem 1rem 0.3rem;
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: lowercase;
  }

  .dropdown button {
    padding: 0.4rem 1rem 0.6rem;
    text-align: left;
    font-size: 0.875rem;
    color: var(--text);
    transition: background 0.1s;
  }

  .dropdown button:hover {
    background: var(--surface-hover);
  }

  .dropdown-feedback {
    border-top: 1px solid var(--border);
    margin-top: 0.25rem;
    padding-top: 0.5rem !important;
  }
</style>

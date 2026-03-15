<script lang="ts">
  import type { User } from "firebase/auth";
  import { getAnonName } from "../services/anonNames";
  import FeedbackModal from "./FeedbackModal.svelte";
  import SettingsModal from "./SettingsModal.svelte";
  import SignInModal from "./SignInModal.svelte";
  import AnonAvatar from "./AnonAvatar.svelte";

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
    onLinkProvider?: (p: string) => Promise<void>;
    onDeleteAccount?: () => Promise<void>;
    onDeleteProgress?: () => void;
    focusEl?: HTMLElement | null;
    onDescend?: () => void;
    onAscend?: () => void;
  }
  let {
    user,
    authReady,
    context,
    onSignIn,
    onSignOut,
    onLinkProvider,
    onDeleteAccount,
    onDeleteProgress,
    focusEl = $bindable<HTMLElement | null>(null),
    onDescend,
    onAscend,
  }: Props = $props();

  let linkedProviderIds = $derived(user?.providerData.map(p => p.providerId) ?? []);

  let open = $state(false);
  let feedbackOpen = $state(false);
  let settingsOpen = $state(false);
  let signInOpen = $state(false);
  let anonName = $state(getAnonName());
  let authBtnEl = $state<HTMLButtonElement | null>(null);
  let dropdownEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    focusEl = authBtnEl;
  });

  function dropdownButtons() {
    return Array.from(
      dropdownEl?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
  }

  function handleDropdownKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      open = false;
      setTimeout(() => authBtnEl?.focus(), 0);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const btns = dropdownButtons();
    const idx = btns.indexOf(e.target as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      btns[idx + 1]?.focus();
    } else {
      if (idx > 0) btns[idx - 1]?.focus();
      else authBtnEl?.focus();
    }
  }

  function toggle() {
    open = !open;
  }

  function handleBtnKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape" || (e.key === "Enter" && open)) {
      e.preventDefault();
      open = false;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open) dropdownButtons()[0]?.focus();
      else { authBtnEl?.blur(); onDescend?.(); }
    }
  }

  function openFeedback() {
    open = false;
    feedbackOpen = true;
  }

  function openSettings() {
    open = false;
    settingsOpen = true;
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

<div class="auth-wrap"
  onmouseenter={() => { if (!document.body.classList.contains('keyboard-nav')) onAscend?.() }}
  onmouseleave={() => { if (!document.body.classList.contains('keyboard-nav')) authBtnEl?.blur() }}
>
  <button
    class="auth-btn"
    bind:this={authBtnEl}
    onclick={toggle}
    onfocus={() => onAscend?.()}
    disabled={!authReady}
    onkeydown={handleBtnKeydown}
    aria-label="account menu"
  >
    <div class="avatar">
      {#if user?.photoURL}
        <img src={user.photoURL} alt="" referrerpolicy="no-referrer" />
      {:else}
        <AnonAvatar />
      {/if}
    </div>
    {#if !authReady}
      <span class="auth-label">█████ ████</span>
    {:else if user}
      <span class="auth-label">{user.displayName?.toLowerCase() ?? user.email}</span>
    {:else}
      <span class="auth-label">{anonName}</span>
    {/if}
  </button>

  {#if open}
    <div
      class="dropdown"
      role="menu"
      tabindex="-1"
      bind:this={dropdownEl}
      onkeydown={handleDropdownKeydown}
      onmouseover={(e) => (e.target as Element).closest("button")?.focus()}
      onfocus={(e) => (e.target as Element).closest("button")?.focus()}
    >
      {#if user}
        <span class="dropdown-label">my account</span>
        <button onclick={openSettings}>settings</button>
        <button
          onclick={() => {
            open = false;
            onSignOut();
          }}>sign out</button
        >
      {:else}
        <span class="dropdown-label">my account</span>
        <button onclick={() => { signInOpen = true; open = false }}>sign in</button>
        <button onclick={openSettings}>settings</button>
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

<SettingsModal
  open={settingsOpen}
  {user}
  {onSignIn}
  {onLinkProvider}
  {onSignOut}
  {onDeleteAccount}
  {onDeleteProgress}
  onFeedback={() => { settingsOpen = false; feedbackOpen = true; }}
  onClose={() => { settingsOpen = false; if (!user) anonName = getAnonName() }}
/>

<SignInModal
  open={signInOpen}
  {onSignIn}
  onClose={() => (signInOpen = false)}
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

  .auth-btn:hover,
  .auth-btn:focus {
    color: var(--text);
  }

  .auth-btn:focus {
    outline: none;
  }

  .auth-btn:hover .avatar,
  .auth-btn:focus .avatar {
    border-color: var(--accent);
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
    background: var(--surface-hover);
  }

  .dropdown button {
    padding: 0.5rem 1rem;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1;
    color: var(--muted);
    outline: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition:
      background 0.1s,
      color 0.1s;
  }

  .dropdown button:hover,
  .dropdown button:focus {
    background: var(--surface-hover);
    color: var(--text);
  }

  .dropdown-feedback {
    border-top: 1px solid var(--border);
    margin-top: 0.25rem;
    padding-top: 0.5rem !important;
  }

</style>

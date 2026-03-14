<script lang="ts">
  import type { User } from "firebase/auth";
  import { getAnonName, rollNewName, setAnonName } from "../services/anonNames";
  import FeedbackModal from "./FeedbackModal.svelte";
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
    focusEl?: HTMLElement | null;
    onDescend?: () => void;
  }
  let {
    user,
    authReady,
    context,
    onSignIn,
    onSignOut,
    focusEl = $bindable<HTMLElement | null>(null),
    onDescend,
  }: Props = $props();

  let open = $state(false);
  let feedbackOpen = $state(false);
  let anonName = $state(getAnonName());
  let nameFocused = $state(false);
  let nameInputEl = $state<HTMLInputElement | null>(null);
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
      else {
        if (user) authBtnEl?.focus();
        else {
          nameInputEl?.focus();
        }
      }
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
      if (open) (user ? dropdownButtons()[0] : nameInputEl)?.focus();
      else { authBtnEl?.blur(); onDescend?.(); }
    }
  }

  function handleNameKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      if (!nameInputEl?.value.trim()) {
        anonName = rollNewName();
      }
      open = false;
      setTimeout(() => authBtnEl?.focus(), 0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      dropdownButtons()[0]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      authBtnEl?.focus();
    }
  }

  function handleNameInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    setAnonName(val);
    anonName = val || anonName;
  }

  function handleNameBlur(e: FocusEvent) {
    const val = (e.target as HTMLInputElement).value.trim();
    if (!val) {
      const newName = rollNewName();
      anonName = newName;
      (e.target as HTMLInputElement).value = newName;
    } else {
      anonName = val;
    }
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

  $effect(() => {
    if (open && !user) nameInputEl?.focus();
  });
</script>

<div class="auth-wrap">
  <button
    class="auth-btn"
    class:active={nameFocused}
    bind:this={authBtnEl}
    onclick={toggle}
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
    {:else if !open}
      <span class="auth-label">{anonName}</span>
    {/if}
  </button>
  {#if open && !user}
    <input
      class="anon-name-input"
      type="text"
      value={anonName}
      size={Math.max(10, anonName.length + 1)}
      bind:this={nameInputEl}
      onfocus={(e) => {
        nameFocused = true;
        (e.target as HTMLInputElement).select();
      }}
      onkeydown={handleNameKeydown}
      oninput={handleNameInput}
      onblur={(e) => {
        nameFocused = false;
        handleNameBlur(e);
      }}
      aria-label="your name"
    />
  {/if}

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

  .auth-btn:hover,
  .auth-btn:focus,
  .auth-btn.active {
    color: var(--text);
  }

  .auth-btn:focus,
  .auth-btn.active {
    outline: none;
  }

  .auth-btn:hover .avatar,
  .auth-btn:focus .avatar,
  .auth-btn.active .avatar {
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
  }

  .dropdown button {
    padding: 0.4rem 1rem 0.6rem;
    text-align: left;
    font-size: 0.875rem;
    color: var(--muted);
    outline: none;
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

  .anon-name-input {
    font-family: inherit;
    font-size: 0.875rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;
    color: var(--muted);
    text-align: right;
    outline: none;
    padding: 0.1rem 0;
    margin-top: 0.25rem;
    min-width: 7rem;
    cursor: text;
    transition:
      color 0.15s,
      border-bottom-color 0.15s;
  }

  .anon-name-input::selection {
    background: var(--accent);
    color: var(--cursor-text);
  }

  .anon-name-input:hover {
    color: var(--text);
    border-bottom-color: var(--border);
  }

  .anon-name-input:focus {
    color: var(--text);
    border-bottom-color: var(--accent);
  }
</style>

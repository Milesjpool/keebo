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
    onLinkProvider?: (p: string) => Promise<void>;
    focusEl?: HTMLElement | null;
    onDescend?: () => void;
  }
  let {
    user,
    authReady,
    context,
    onSignIn,
    onSignOut,
    onLinkProvider,
    focusEl = $bindable<HTMLElement | null>(null),
    onDescend,
  }: Props = $props();

  let linkedProviderIds = $derived(user?.providerData.map(p => p.providerId) ?? []);

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
        {#if !linkedProviderIds.includes('google.com')}
          <button onclick={() => { open = false; onLinkProvider?.('google'); }}>
            <svg class="provider-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z"/></svg>
            Google
            <span class="link-tip" title="Link this provider to your account"><svg class="link-icon" viewBox="0 0 442.246 442.246" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g><g><path d="M409.657,32.474c-43.146-43.146-113.832-43.146-156.978,0l-84.763,84.762c29.07-8.262,60.589-6.12,88.129,6.732l44.063-44.064c17.136-17.136,44.982-17.136,62.118,0c17.136,17.136,17.136,44.982,0,62.118l-55.386,55.386l-36.414,36.414c-17.136,17.136-44.982,17.136-62.119,0l-47.43,47.43c11.016,11.017,23.868,19.278,37.332,24.48c36.415,14.382,78.643,8.874,110.467-16.219c3.06-2.447,6.426-5.201,9.18-8.262l57.222-57.222l34.578-34.578C453.109,146.306,453.109,75.926,409.657,32.474z"/><path d="M184.135,320.114l-42.228,42.228c-17.136,17.137-44.982,17.137-62.118,0c-17.136-17.136-17.136-44.981,0-62.118l91.8-91.799c17.136-17.136,44.982-17.136,62.119,0l47.43-47.43c-11.016-11.016-23.868-19.278-37.332-24.48c-38.25-15.3-83.232-8.262-115.362,20.502c-1.53,1.224-3.06,2.754-4.284,3.978l-91.8,91.799c-43.146,43.146-43.146,113.832,0,156.979c43.146,43.146,113.832,43.146,156.978,0l82.927-83.845C230.035,335.719,220.243,334.496,184.135,320.114z"/></g></g></svg></span>
          </button>
        {/if}
        {#if !linkedProviderIds.includes('github.com')}
          <button onclick={() => { open = false; onLinkProvider?.('github'); }}>
            <svg class="provider-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)"/></svg>
            GitHub
            <span class="link-tip" title="Link this provider to your account"><svg class="link-icon" viewBox="0 0 442.246 442.246" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g><g><path d="M409.657,32.474c-43.146-43.146-113.832-43.146-156.978,0l-84.763,84.762c29.07-8.262,60.589-6.12,88.129,6.732l44.063-44.064c17.136-17.136,44.982-17.136,62.118,0c17.136,17.136,17.136,44.982,0,62.118l-55.386,55.386l-36.414,36.414c-17.136,17.136-44.982,17.136-62.119,0l-47.43,47.43c11.016,11.017,23.868,19.278,37.332,24.48c36.415,14.382,78.643,8.874,110.467-16.219c3.06-2.447,6.426-5.201,9.18-8.262l57.222-57.222l34.578-34.578C453.109,146.306,453.109,75.926,409.657,32.474z"/><path d="M184.135,320.114l-42.228,42.228c-17.136,17.137-44.982,17.137-62.118,0c-17.136-17.136-17.136-44.981,0-62.118l91.8-91.799c17.136-17.136,44.982-17.136,62.119,0l47.43-47.43c-11.016-11.016-23.868-19.278-37.332-24.48c-38.25-15.3-83.232-8.262-115.362,20.502c-1.53,1.224-3.06,2.754-4.284,3.978l-91.8,91.799c-43.146,43.146-43.146,113.832,0,156.979c43.146,43.146,113.832,43.146,156.978,0l82.927-83.845C230.035,335.719,220.243,334.496,184.135,320.114z"/></g></g></svg></span>
          </button>
        {/if}
        <button
          onclick={() => {
            open = false;
            onSignOut();
          }}>sign out</button
        >
      {:else}
        <span class="dropdown-label">sign in</span>
        <button onclick={() => signInWith("google")}>
          <svg class="provider-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z"/></svg>
          Google
        </button>
        <button onclick={() => signInWith("github")}>
          <svg class="provider-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)"/></svg>
          GitHub
        </button>
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

  .provider-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    position: relative;
    top: -1px;
  }

  .link-tip {
    display: contents;
  }

  .link-icon {
    width: 9px;
    height: 9px;
    flex-shrink: 0;
    opacity: 0.5;
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

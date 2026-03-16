<script lang="ts">
  import type { User } from "firebase/auth";
  import { useKeydown } from "../services/utils";
  import { getAnonName, setAnonName, rollNewName } from "../services/anonNames";
  import Modal from "./Modal.svelte";
  import ConfirmExpander from "./ConfirmExpander.svelte";

  interface Props {
    open: boolean;
    user: User | null;
    onSignIn?: (p: string) => Promise<void>;
    onLinkProvider?: (p: string) => Promise<void>;
    onSignOut?: () => void;
    onDeleteAccount?: () => Promise<void>;
    onDeleteProgress?: () => void;
    onFeedback: () => void;
    onClose: () => void;
  }
  let {
    open,
    user,
    onSignIn,
    onLinkProvider,
    onSignOut,
    onDeleteAccount,
    onDeleteProgress,
    onFeedback,
    onClose,
  }: Props = $props();

  let linkedProviderIds = $derived(
    user?.providerData.map((p) => p.providerId) ?? [],
  );
  let confirmOpen = $state(false);
  let confirmTriggerEl = $state<HTMLButtonElement | null>(null);
  let confirmCancelEl = $state<HTMLButtonElement | null>(null);
  let confirmConfirmEl = $state<HTMLButtonElement | null>(null);
  let deleting = $state(false);
  let nameVal = $state("");
  let modalEl = $state<HTMLDivElement | null>(null);
  let closeBtnEl = $state<HTMLButtonElement | null>(null);
  let nameInputEl = $state<HTMLInputElement | null>(null);
  let renameRowEl = $state<HTMLDivElement | null>(null);

  function modalButtons() {
    return Array.from(
      modalEl?.querySelectorAll<HTMLElement>('button:not(:disabled):not(.name-blur-btn):not([data-no-keynav]), input.name-input, [data-keynav-item]') ?? []
    );
  }

  function handleSignIn(provider: string) {
    onClose();
    onSignIn?.(provider);
  }

  async function handleDelete() {
    if (!user) {
      onDeleteProgress?.();
      confirmOpen = false;
      onClose();
    } else {
      deleting = true;
      try {
        await onDeleteAccount?.();
        confirmOpen = false;
        onClose();
      } finally {
        deleting = false;
      }
    }
  }

  function handleClose() {
    confirmOpen = false;
    onClose();
  }

  $effect(() => {
    if (!open) {
      confirmOpen = false;
      return;
    }
    if (!user) nameVal = getAnonName();
    setTimeout(() => closeBtnEl?.focus(), 0);
    const cleanup = useKeydown(
      {
        Escape: () => {
          if (confirmOpen) {
            confirmOpen = false;
          } else {
            handleClose();
          }
        },
        Enter: (e) => {
          if (document.activeElement === nameInputEl) {
            e.preventDefault();
            renameRowEl?.focus();
          } else if (document.activeElement === renameRowEl) {
            e.preventDefault();
            nameInputEl?.focus();
          } else if (document.activeElement === confirmTriggerEl) {
            e.preventDefault();
            confirmOpen = !confirmOpen;
          }
        },
        ArrowLeft: (e) => {
          if (confirmOpen) { e.preventDefault(); confirmCancelEl?.focus(); }
        },
        ArrowRight: (e) => {
          if (confirmOpen) { e.preventDefault(); confirmConfirmEl?.focus(); }
        },
        ArrowDown: (e) => {
          e.preventDefault();
          const btns = modalButtons();
          const raw = document.activeElement === renameRowEl ? nameInputEl : document.activeElement;
          const isConfirmBtn = (raw as HTMLElement)?.hasAttribute('data-no-keynav');
          const active = isConfirmBtn ? confirmTriggerEl : raw;
          const i = btns.indexOf(active as HTMLElement);
          btns[i + 1]?.focus();
        },
        ArrowUp: (e) => {
          e.preventDefault();
          const raw = document.activeElement === renameRowEl ? nameInputEl : document.activeElement;
          const isConfirmBtn = (raw as HTMLElement)?.hasAttribute('data-no-keynav');
          const active = isConfirmBtn ? confirmTriggerEl : raw;
          const btns = modalButtons();
          const i = btns.indexOf(active as HTMLElement);
          if (i > 0) btns[i - 1]?.focus();
        },
      },
      { capture: true, stopAll: true },
    );
    return () => cleanup();
  });
</script>

{#if open}
  <Modal title="settings" labelId="settings-title" onClose={handleClose} bind:closeBtnEl bind:modalEl>
    {#if user}
        <section>
          <span class="section-label">connections</span>
          {#each [{ id: "google.com", name: "Google", svgPath: "google", action: () => onLinkProvider?.("google") }, { id: "github.com", name: "GitHub", svgPath: "github", action: () => onLinkProvider?.("github") }].sort( (a, b) => (linkedProviderIds.includes(b.id) ? 1 : -1), ) as p}
            {@const connected = linkedProviderIds.includes(p.id)}
            <svelte:element
              this={connected ? "div" : "button"}
              class="provider-row"
              class:provider-unlinked={!connected}
              onclick={connected ? undefined : p.action}
            >
              {#if p.svgPath === "google"}
                <svg
                  class="provider-icon"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  ><path
                    d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z"
                  /></svg
                >
              {:else}
                <svg
                  class="provider-icon"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  ><path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                    transform="scale(64)"
                  /></svg
                >
              {/if}
              <span class="provider-name">{p.name}</span>
              <span class="provider-status">
                {#if connected}
                  <svg
                    class="connected-icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><circle cx="8" cy="8" r="7.5" stroke="currentColor" /><path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                  >
                {:else}
                  <svg
                    class="plus-icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    /></svg
                  >
                {/if}
              </span>
            </svelte:element>
          {/each}
        </section>

        <section>
          <span class="section-label">account</span>
          <button
            class="btn-action"
            onclick={() => {
              onClose();
              onSignOut?.();
            }}>sign out</button
          >
          <ConfirmExpander
            label="delete account"
            warningText="this will permanently delete your account and all progress."
            confirmLabel="confirm delete"
            loadingLabel="deleting…"
            onConfirm={handleDelete}
            disabled={deleting}
            bind:open={confirmOpen}
            bind:triggerEl={confirmTriggerEl}
            bind:cancelEl={confirmCancelEl}
            bind:confirmEl={confirmConfirmEl}
          />
        </section>
      {:else}
        <section>
          <span class="section-label">connections</span>
          {#each [{ provider: "google", name: "Google", svgPath: "google" }, { provider: "github", name: "GitHub", svgPath: "github" }] as p}
            <button
              class="provider-row provider-unlinked"
              onclick={() => handleSignIn(p.provider)}
            >
              {#if p.svgPath === "google"}
                <svg
                  class="provider-icon"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  ><path
                    d="M473.16,221.48l-2.26-9.59H262.46v88.22H387c-12.93,61.4-72.93,93.72-121.94,93.72-35.66,0-73.25-15-98.13-39.11a140.08,140.08,0,0,1-41.8-98.88c0-37.16,16.7-74.33,41-98.78s61-38.13,97.49-38.13c41.79,0,71.74,22.19,82.94,32.31l62.69-62.36C390.86,72.72,340.34,32,261.6,32h0c-60.75,0-119,23.27-161.58,65.71C58,139.5,36.25,199.93,36.25,256S56.83,369.48,97.55,411.6C141.06,456.52,202.68,480,266.13,480c57.73,0,112.45-22.62,151.45-63.66,38.34-40.4,58.17-96.3,58.17-154.9C475.75,236.77,473.27,222.12,473.16,221.48Z"
                  /></svg
                >
              {:else}
                <svg
                  class="provider-icon"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  ><path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                    transform="scale(64)"
                  /></svg
                >
              {/if}
              <span class="provider-name">{p.name}</span>
              <span class="provider-status">
                <svg
                  class="plus-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  /></svg
                >
              </span>
            </button>
          {/each}
        </section>

        <section>
          <span class="section-label">account</span>
          <div
            class="rename-row"
            tabindex="-1"
            bind:this={renameRowEl}
            onmouseenter={() => { if (document.activeElement !== nameInputEl) renameRowEl?.focus() }}
            onmouseleave={() => renameRowEl?.blur()}
          >
            <input
              class="name-input"
              bind:this={nameInputEl}
              type="text"
              value={nameVal}
              onfocus={(e) => (e.target as HTMLInputElement).select()}
              oninput={(e) => {
                nameVal = (e.target as HTMLInputElement).value;
                if (nameVal.trim()) setAnonName(nameVal);
              }}
              onblur={(e) => {
                const val = (e.target as HTMLInputElement).value.trim();
                if (!val) {
                  nameVal = rollNewName();
                  (e.target as HTMLInputElement).value = nameVal;
                }
              }}
              placeholder="your name"
            />
            <button
              class="name-blur-btn"
              tabindex="-1"
              onmousedown={(e) => { e.preventDefault(); renameRowEl?.focus() }}
            >×</button>
          </div>
          <ConfirmExpander
            label="reset progress"
            warningText="this will permanently erase all your scores and history."
            confirmLabel="confirm reset"
            onConfirm={handleDelete}
            bind:open={confirmOpen}
            bind:triggerEl={confirmTriggerEl}
            bind:cancelEl={confirmCancelEl}
            bind:confirmEl={confirmConfirmEl}
          />
        </section>
      {/if}

    <div class="footer-sep">
      <a
        class="btn-footer-link"
        href="https://ko-fi.com/milesjpool"
        target="_blank"
        rel="noopener noreferrer"
        data-keynav-item
        onmouseenter={(e) => (e.currentTarget as HTMLAnchorElement).focus()}
        onmouseleave={(e) => (e.currentTarget as HTMLAnchorElement).blur()}
      >
        <img src="/logo-ko-fi.png" class="kofi-logo" alt="" />
        support keebo
      </a>
      <button class="btn-feedback" onclick={onFeedback}>feedback</button>
    </div>
  </Modal>
{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .section-label {
    display: block;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    padding: 0.35rem 2rem;
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: lowercase;
    background: var(--surface-hover);
    margin-bottom: 0.5rem;
  }

  .provider-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    transition: background 0.1s;
    font-family: inherit;
    font-size: inherit;
    background: none;
    border: none;
    text-align: left;
  }

  .provider-unlinked {
    cursor: pointer;
  }

  .provider-unlinked:focus {
    background: var(--surface-hover);
    outline: none;
  }

  .provider-unlinked:focus .provider-icon {
    color: var(--text);
  }

  .provider-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--muted);
  }

  .provider-row:not(.provider-unlinked) .provider-icon {
    color: var(--text);
  }

  .provider-name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .provider-unlinked:focus .provider-name {
    color: var(--text);
  }

  .provider-status {
    display: flex;
    align-items: center;
  }

  .connected-icon {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: var(--green);
  }

  .plus-icon {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: var(--muted);
  }

  .provider-unlinked:focus .plus-icon {
    color: var(--text);
  }

  .btn-action {
    font-size: 0.875rem;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.6rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    text-align: left;
    transition:
      background 0.1s,
      color 0.1s;
  }

  .btn-action:focus {
    color: var(--text);
    background: var(--surface-hover);
    outline: none;
  }

  .rename-row {
    position: relative;
    padding: 0.5rem 2rem;
    width: calc(100% + 4rem);
    margin-left: -2rem;
    transition: background 0.1s;
    outline: none;
  }

  .rename-row:focus-within {
    background: var(--surface-hover);
  }

  .name-blur-btn {
    position: absolute;
    right: 2rem;
    bottom: 0.65rem;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--muted);
    padding: 0;
    line-height: 1.4;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s;
  }

  .rename-row:has(input:focus) .name-blur-btn {
    opacity: 1;
    pointer-events: auto;
  }

  .name-input {
    width: 100%;
    font-family: inherit;
    font-size: 0.875rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    outline: none;
    padding: 0.2rem 1.2rem 0.2rem 0;
  }

  .name-input:focus {
    border-bottom-color: var(--accent);
  }

  .name-input::selection {
    background: var(--accent);
    color: var(--cursor-text);
  }

  .footer-sep {
    width: calc(100% + 4rem);
    margin-left: -2rem;
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    margin-bottom: -1rem;
  }

  .btn-footer-link,
  .btn-feedback {
    font-size: 0.875rem;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.6rem 2rem;
    width: 100%;
    text-align: left;
    transition:
      background 0.1s,
      color 0.1s;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-footer-link:focus,
  .btn-feedback:focus {
    color: var(--text);
    background: var(--surface-hover);
    outline: none;
  }

  .kofi-logo {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
    opacity: 0.6;
  }

  .btn-footer-link:focus .kofi-logo {
    opacity: 1;
  }

</style>

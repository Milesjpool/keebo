<script lang="ts">
  import type { User } from "firebase/auth";
  import { version } from "../../package.json";
  import { useKeydown } from "../services/utils";
  import { getAnonName, setAnonName, rollNewName } from "../services/anonNames";
  import Modal from "./Modal.svelte";
  import ConfirmExpander from "./ConfirmExpander.svelte";
  import ProviderIcon from "./ProviderIcon.svelte";

  const buildNumber = import.meta.env.VITE_BUILD_NUMBER;
  const commitHash = import.meta.env.VITE_COMMIT_HASH;
  const appVersion = buildNumber
    ? `v${version.split(".").slice(0, 2).join(".")}.${buildNumber}-${commitHash.slice(0, 7)}`
    : `v${version}`;

  const providers = [
    { id: "google.com", key: "google" as const, name: "Google" },
    { id: "github.com", key: "github" as const, name: "GitHub" },
  ];

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
    <section>
      <span class="section-label">connections</span>
      {#each user ? providers.toSorted((a, b) => Number(linkedProviderIds.includes(b.id)) - Number(linkedProviderIds.includes(a.id))) : providers as p}
        {@const connected = user !== null && linkedProviderIds.includes(p.id)}
        <svelte:element
          this={connected ? "div" : "button"}
          class="provider-row"
          class:provider-unlinked={!connected}
          onclick={connected ? undefined : () => user ? onLinkProvider?.(p.key) : handleSignIn(p.key)}
        >
          <ProviderIcon provider={p.key} />
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

    {#if user}
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
      <button class="btn-feedback" onclick={onFeedback}>feedback</button>
      <a
        class="btn-footer-link"
        href="https://ko-fi.com/milesjpool"
        target="_blank"
        rel="noopener noreferrer"
        data-keynav-item
        onmouseenter={(e) => (e.currentTarget as HTMLAnchorElement).focus()}
        onmouseleave={(e) => (e.currentTarget as HTMLAnchorElement).blur()}
      >
        <img src="{import.meta.env.BASE_URL}logo-ko-fi.png" class="kofi-logo" alt="" />
        support keebo
      </a>
      <span class="version">{appVersion}</span>
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

  .provider-unlinked:focus :global(.provider-icon) {
    color: var(--text);
  }

  .provider-row:not(.provider-unlinked) :global(.provider-icon) {
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
  }

  .version {
    display: block;
    text-align: center;
    font-size: 0.65rem;
    color: var(--muted);
    padding-top: 0.5rem;
  }

</style>

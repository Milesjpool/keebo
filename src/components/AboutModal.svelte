<script lang="ts">
  import { version } from "../../package.json";
  import { useKeydown } from "../services/utils";
  import { hoverFocus } from "../services/actions";
  import Modal from "./Modal.svelte";
  import Icon from "./Icon.svelte";
  import svelteSvg from "../assets/logo-svelte.svg?raw";
  import tsSvg from "../assets/logo-typescript.svg?raw";
  import firebaseSvg from "../assets/logo-firebase.svg?raw";
  import githubSvg from "../assets/logo-github.svg?raw";
  import claudeSvg from "../assets/logo-claude.svg?raw";

  const buildNumber = import.meta.env.VITE_BUILD_NUMBER;
  const commitHash = import.meta.env.VITE_COMMIT_HASH;
  const appVersion = buildNumber
    ? `v${version.split(".").slice(0, 2).join(".")}.${buildNumber}-${commitHash.slice(0, 7)}`
    : `v${version}`;

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  let closeBtnEl = $state<HTMLButtonElement | null>(null);
  let modalEl = $state<HTMLDivElement | null>(null);

  function getRows(): HTMLElement[][] {
    if (!modalEl) return [];
    const rows: HTMLElement[][] = [
      closeBtnEl ? [closeBtnEl] : [],
      Array.from(modalEl.querySelectorAll<HTMLElement>('.btn-row a')),
      Array.from(modalEl.querySelectorAll<HTMLElement>('.tech-logos a')),
      Array.from(modalEl.querySelectorAll<HTMLElement>('.version')),
    ];
    return rows.filter(r => r.length > 0);
  }

  function findCurrent(rows: HTMLElement[][]): [number, number] {
    const active = document.activeElement as HTMLElement;
    for (let r = 0; r < rows.length; r++) {
      const c = rows[r].indexOf(active);
      if (c !== -1) return [r, c];
    }
    return [0, 0];
  }

  function navigate(e: KeyboardEvent) {
    const rows = getRows();
    if (!rows.length) return;
    const [r, c] = findCurrent(rows);

    if (e.key === 'ArrowDown' || e.key === 's') {
      e.preventDefault();
      const nr = Math.min(r + 1, rows.length - 1);
      rows[nr][Math.min(c, rows[nr].length - 1)]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
      e.preventDefault();
      const nr = Math.max(r - 1, 0);
      rows[nr][Math.min(c, rows[nr].length - 1)]?.focus();
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      e.preventDefault();
      rows[r][Math.min(c + 1, rows[r].length - 1)]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      e.preventDefault();
      rows[r][Math.max(c - 1, 0)]?.focus();
    }
  }

  $effect(() => {
    if (!open) return;
    setTimeout(() => closeBtnEl?.focus(), 0);
    return useKeydown({
      Escape: () => onClose(),
      ArrowDown: navigate,
      ArrowUp: navigate,
      ArrowLeft: navigate,
      ArrowRight: navigate,
      w: navigate,
      a: navigate,
      s: navigate,
      d: navigate,
    }, { stopAll: true });
  });
</script>

{#if open}
  <Modal
    title="about keebo"
    labelId="about-modal"
    {onClose}
    bind:closeBtnEl
    bind:modalEl
    style="--modal-max-width: 480px; --modal-gap: 1rem"
  >
    <div class="hero-section">
      <div
        class="hero-bg"
        style="--hero-dark: url('{import.meta.env
          .BASE_URL}hero-dark.png'); --hero-light: url('{import.meta.env
          .BASE_URL}hero-light.png')"
      ></div>
      <p class="body-text">
        a clean, free and open-source touch-typing tutor with sequential lessons
        and a keyboard-first interface.
      </p>
      <p class="body-text">
        i couldn't find one i liked, so i made keebo instead.
      </p>
      <div class="btn-row">
        <a
          class="btn-secondary support-btn"
          href="https://ko-fi.com/milesjpool"
          target="_blank"
          rel="noopener noreferrer"
          use:hoverFocus
          ><img
            src="{import.meta.env.BASE_URL}logo-ko-fi.png"
            class="kofi-logo"
            alt=""
          />support keebo</a
        >
        <a
          class="btn-secondary miles-btn"
          href="https://milesjpool.com"
          target="_blank"
          rel="noopener noreferrer"
          use:hoverFocus>👾 Miles</a
        >
      </div>
    </div>

    <hr class="divider" />

    <p class="body-text tagline">🤖 AI coded, human approved</p>
    <div class="tech-logos">
      <a class="tech-logo" title="Svelte" href="https://svelte.dev" target="_blank" rel="noopener noreferrer" use:hoverFocus><Icon svg={svelteSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="TypeScript" href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" use:hoverFocus><Icon svg={tsSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="Firebase" href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" use:hoverFocus><Icon svg={firebaseSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="GitHub Pages" href="https://pages.github.com" target="_blank" rel="noopener noreferrer" use:hoverFocus><Icon svg={githubSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="Claude" href="https://claude.ai" target="_blank" rel="noopener noreferrer" use:hoverFocus><Icon svg={claudeSvg} class="tech-icon" /></a>
    </div>

    <a
      class="version modal-full-bleed"
      href="https://github.com/milesjpool/keebo"
      target="_blank"
      rel="noopener noreferrer"
      use:hoverFocus>{appVersion}</a
    >
  </Modal>
{/if}

<style>
  .hero-section {
    position: relative;
    padding-top: 0.5rem;
    overflow: visible;
  }

  .hero-bg {
    position: absolute;
    inset: 0 -1rem -3rem;
    background: var(--hero-dark) center / contain no-repeat;
    opacity: 0.05;
    pointer-events: none;
  }

  :global([data-theme="light"]) .tech-logo {
    color: #181717;
  }

  :global([data-theme="light"]) .hero-bg {
    background-image: var(--hero-light);
    opacity: 0.12;
  }

  @media (prefers-color-scheme: light) {
    :global([data-theme="auto"]) .tech-logo {
      color: #181717;
    }

    :global([data-theme="auto"]) .hero-bg {
      background-image: var(--hero-light);
      opacity: 0.12;
    }
  }

  .body-text {
    font-size: 0.85rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
    text-align: center;
  }

  .hero-section .body-text {
    margin-top: 1rem;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
  }

  .tagline {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }

  .tech-logos {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: -0.5rem;
  }

  .tech-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #fff;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    box-sizing: content-box;
    transition: opacity 0.1s;
    opacity: 0.7;
  }

  .tech-logo:focus {
    outline: none;
    opacity: 1;
    background: var(--surface-hover);
  }

  :global(.tech-icon) {
    display: flex;
    line-height: 0;
  }

  :global(.tech-icon svg) {
    width: 18px;
    height: 18px;
  }

  .btn-row {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  .support-btn,
  .miles-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
  }

  .kofi-logo {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .version {
    display: block;
    font-size: 0.65rem;
    color: var(--muted);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-align: center;
    padding: 0.6rem 2rem;
    margin-bottom: -1rem;
    transition: background 0.1s, color 0.1s;
  }

  .version:focus {
    color: var(--text);
    background: var(--surface-hover);
    outline: none;
  }
</style>

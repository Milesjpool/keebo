<script lang="ts">
  import { version } from "../../package.json";
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
    onFeedback: () => void;
  }
  let { onFeedback }: Props = $props();
</script>

<div
  class="mobile-landing"
  style="--hero-dark: url('{import.meta.env.BASE_URL}hero-dark.png'); --hero-light: url('{import.meta.env.BASE_URL}hero-light.png')"
>
  <div class="hero-bg"></div>

  <div class="content">
    <div class="header">
      <h1 class="title">keebo</h1>
      <p class="subtitle">touch typing, step by step</p>
    </div>

    <p class="body">
      a clean, free and open-source touch-typing tutor with sequential lessons
      and a keyboard-first interface.
      <br /><br />
      <span class="cta">come back on a laptop or desktop to start learning.</span>
    </p>

    <div class="btn-row">
      <a
        class="btn-secondary action-btn"
        href="https://ko-fi.com/milesjpool"
        target="_blank"
        rel="noopener noreferrer"
      ><img
          src="{import.meta.env.BASE_URL}logo-ko-fi.png"
          class="kofi-logo"
          alt=""
        />support keebo</a
      >
      <button
        class="btn-secondary action-btn feedback-btn"
        onclick={onFeedback}
      >send feedback</button>
    </div>

    <div class="tech-logos">
      <a class="tech-logo" title="Svelte" href="https://svelte.dev" target="_blank" rel="noopener noreferrer"><Icon svg={svelteSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="TypeScript" href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"><Icon svg={tsSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="Firebase" href="https://firebase.google.com" target="_blank" rel="noopener noreferrer"><Icon svg={firebaseSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="GitHub Pages" href="https://pages.github.com" target="_blank" rel="noopener noreferrer"><Icon svg={githubSvg} class="tech-icon" /></a>
      <a class="tech-logo" title="Claude" href="https://claude.ai" target="_blank" rel="noopener noreferrer"><Icon svg={claudeSvg} class="tech-icon" /></a>
    </div>

    <p class="tagline">🤖 AI coded, human approved</p>
  </div>

  <div class="footer">
    <a
      class="footer-link"
      href="https://milesjpool.com"
      target="_blank"
      rel="noopener noreferrer"
    >👾 Miles</a>
    <a
      class="footer-link version"
      href="https://github.com/milesjpool/keebo"
      target="_blank"
      rel="noopener noreferrer"
    >{appVersion}</a>
  </div>
</div>

<style>
  .mobile-landing {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--bg);
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: var(--hero-dark) center / contain no-repeat;
    opacity: 0.08;
    pointer-events: none;
  }

  @media (prefers-color-scheme: light) {
    .hero-bg {
      background-image: var(--hero-light);
      opacity: 0.12;
    }

    .tech-logo {
      color: #181717;
    }
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1.5rem;
    gap: 1rem;
    max-width: 360px;
    width: 100%;
  }

  .header {
    align-self: flex-start;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 2.5rem;
    letter-spacing: 0.15em;
    color: var(--correct);
    margin: 0;
  }

  .subtitle {
    color: var(--muted);
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
  }

  .body {
    font-size: 0.85rem;
    color: var(--muted);
    margin: 1.5rem 0;
    line-height: 1.5;
    text-align: center;
  }

  .cta {
    color: var(--text);
  }

  .btn-row {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    text-decoration: none;
    min-height: 44px;
    flex: 1;
    max-width: 10rem;
  }

  .feedback-btn {
    justify-content: flex-end;
    text-align: right;
  }

  .kofi-logo {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .tech-logos {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .tech-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #fff;
    width: 28px;
    height: 28px;
    opacity: 0.7;
  }

  :global(.tech-icon) {
    display: flex;
    line-height: 0;
  }

  :global(.tech-icon svg) {
    width: 18px;
    height: 18px;
  }

  .tagline {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.02em;
    margin: 0;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    pointer-events: none;
  }

  .footer-link {
    font-size: 0.75rem;
    color: var(--muted);
    text-decoration: none;
    pointer-events: auto;
  }

  .version {
    font-size: 0.65rem;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>

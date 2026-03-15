<script lang="ts">
  import ThemeToggle from "./ThemeToggle.svelte";

  const AI_LABEL = "AI Coded, Human Approved";

  let label = $state("");
  let hovered = false;
  let timers: ReturnType<typeof setTimeout>[] = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function animateIn(text: string) {
    clearTimers();
    label = "";
    for (let i = 1; i <= text.length; i++) {
      timers.push(
        setTimeout(() => {
          label = text.slice(0, i);
        }, i * 5),
      );
    }
  }

  function animateOut() {
    clearTimers();
    const text = label;
    for (let i = text.length - 1; i >= 0; i--) {
      timers.push(
        setTimeout(
          () => {
            label = text.slice(0, i);
          },
          (text.length - i) * 10,
        ),
      );
    }
  }
</script>

<a
  class="ai-link"
  href="https://github.com/Milesjpool/keebo"
  target="_blank"
  rel="noreferrer"
  onclick={(e) => e.currentTarget.blur()}
  onmouseenter={(e) => {
    hovered = true;
    animateIn(AI_LABEL);
    (e.currentTarget as HTMLAnchorElement).focus();
  }}
  onmouseleave={(e) => {
    hovered = false;
    animateOut();
    (e.currentTarget as HTMLAnchorElement).blur();
  }}><span class="emoji">🤖</span><span class="label">{label}</span></a
>

<a
  class="author"
  href="https://www.milesjpool.com"
  target="_blank"
  rel="noreferrer"
  onclick={(e) => e.currentTarget.blur()}
  onmouseenter={(e) => (e.currentTarget as HTMLAnchorElement).focus()}
  onmouseleave={(e) => (e.currentTarget as HTMLAnchorElement).blur()}><span class="emoji">👾</span> Miles</a
>

<ThemeToggle />

<style>
  .ai-link {
    position: fixed;
    bottom: 1.5rem;
    left: 1.75rem;
    font-size: 0.75rem;
    color: var(--muted);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.15s;
  }

  .ai-link:focus {
    color: var(--text);
    cursor: pointer;
    outline: none;
  }

  .author {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: var(--muted);
    text-decoration: none;
    white-space: nowrap;
  }

  .author:focus {
    color: var(--text);
    outline: none;
  }

  .emoji {
    font-size: 1rem;
    vertical-align: -1px;
  }

  .label {
    white-space: nowrap;
  }
</style>

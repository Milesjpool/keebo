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
  onmouseenter={() => {
    hovered = true;
    animateIn(AI_LABEL);
  }}
  onmouseleave={() => {
    hovered = false;
    animateOut();
  }}><span class="emoji">🤖</span><span class="label">{label}</span></a
>

<a
  class="author"
  href="https://www.milesjpool.com"
  target="_blank"
  rel="noreferrer"
  onclick={(e) => e.currentTarget.blur()}><span class="emoji">👾</span> Miles</a
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

  .ai-link:hover {
    color: var(--text);
    cursor: pointer;
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

  .author:hover {
    color: var(--text);
  }

  .emoji {
    font-size: 1rem;
    vertical-align: -1px;
  }

  .label {
    white-space: nowrap;
  }
</style>

<script lang="ts">
  const THEMES = ["dark", "light", "auto"];
  const ICONS: Record<string, string> = { dark: "🌛", light: "🌞", auto: "🌍" };

  let theme = $state(localStorage.getItem("theme") ?? "auto");
  let label = $state("");
  let hovered = false;
  let timers: ReturnType<typeof setTimeout>[] = [];

  $effect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function animateIn(text: string) {
    clearTimers();
    label = "";
    for (let i = 1; i <= text.length; i++) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, i * 30));
    }
  }

  function animateOut() {
    clearTimers();
    const text = label;
    for (let i = text.length - 1; i >= 0; i--) {
      timers.push(setTimeout(() => { label = text.slice(0, i) }, (text.length - i) * 22));
    }
  }

  function toggle(e: MouseEvent) {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    if (hovered) animateIn(theme);
    (e.currentTarget as HTMLElement).blur();
  }
</script>

<button
  class="theme-toggle"
  onclick={toggle}
  onmouseenter={() => { hovered = true; animateIn(theme) }}
  onmouseleave={() => { hovered = false; animateOut() }}
>
  <span class="label">{label}</span><span class="emoji">{ICONS[theme]}</span>
</button>

<style>
  .theme-toggle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.75rem;
    font-size: 0.75rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.15s;
  }

  .theme-toggle:hover {
    color: var(--text);
  }

  .label {
    color: var(--muted);
    min-width: 0;
  }

  .emoji {
    font-size: 1rem;
    vertical-align: -1px;
  }
</style>

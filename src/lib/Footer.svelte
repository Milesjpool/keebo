<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte'
</script>

<a
  class="author"
  href="https://www.milesjpool.com"
  target="_blank"
  rel="noreferrer"
  onclick={e => e.currentTarget.blur()}
><span class="emoji">👾</span> Miles</a>

<a
  class="footer"
  href="https://github.com/Milesjpool/keebo"
  target="_blank"
  rel="noreferrer"
  onclick={e => e.currentTarget.blur()}
><span class="emoji">🤖</span> <strong>AI</strong> Coded, Human Approved</a>

<ThemeToggle />

<style>
  .author {
    position: fixed;
    bottom: 1.5rem;
    left: 1.75rem;
    font-size: 0.75rem;
    color: var(--muted);
    text-decoration: none;
  }

  .author:hover {
    color: var(--text);
  }

  .footer {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: var(--muted);
    white-space: nowrap;
    text-decoration: none;
  }

  .footer:hover {
    color: var(--text);
  }

  .emoji {
    font-size: 1rem;
    vertical-align: -1px;
  }
</style>

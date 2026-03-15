<script lang="ts">
  interface Props { text: string }
  const { text }: Props = $props()

  type Part = { type: 'text'; content: string } | { type: 'link'; label: string; url: string }

  function parse(str: string): Part[] {
    const parts: Part[] = []
    const re = /\[([^\]]+)\]\(([^)]+)\)/g
    let last = 0
    for (const m of str.matchAll(re)) {
      if (m.index > last) parts.push({ type: 'text', content: str.slice(last, m.index) })
      parts.push({ type: 'link', label: m[1], url: m[2] })
      last = m.index + m[0].length
    }
    if (last < str.length) parts.push({ type: 'text', content: str.slice(last) })
    return parts
  }
</script>

<span class="attribution">{#each parse(text) as part}{#if part.type === 'link'}<a href={part.url} target="_blank" rel="noreferrer" onclick={(e) => (e.currentTarget as HTMLAnchorElement).blur()} onmouseenter={(e) => (e.currentTarget as HTMLAnchorElement).focus()} onmouseleave={(e) => (e.currentTarget as HTMLAnchorElement).blur()}>{part.label}</a>{:else}{part.content}{/if}{/each}</span>

<style>
  .attribution {
    font-size: 0.7rem;
    color: var(--dim);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:focus {
    color: var(--muted);
    outline: none;
  }
</style>

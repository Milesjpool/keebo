<script lang="ts">
  interface Props { svg: string; class?: string }
  let { svg, class: className = '' }: Props = $props()
</script>

<span class="icon {className}" aria-hidden="true">{@html svg}</span>

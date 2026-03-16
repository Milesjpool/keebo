<script lang="ts">
  import googleSvg from '../assets/logo-google.svg?raw'
  import githubSvg from '../assets/logo-github.svg?raw'
  import Icon from './Icon.svelte'

  interface Props { provider: 'google' | 'github' }
  let { provider }: Props = $props()
</script>

<Icon svg={provider === 'google' ? googleSvg : githubSvg} class="provider-icon" />

<style>
  :global(.provider-icon svg) {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--muted);
  }
</style>

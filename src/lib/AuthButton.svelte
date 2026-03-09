<script>
  let { user, authReady, onSignIn, onSignOut } = $props()

  let open = $state(false)

  function toggle() {
    open = !open
  }

  function signInWith(provider) {
    open = false
    onSignIn(provider)
  }

  function onDocClick(e) {
    if (!e.target.closest('.auth-wrap')) open = false
  }

  $effect(() => {
    if (open) {
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }
  })
</script>

<div class="auth-wrap">
  <button class="auth-btn" onclick={toggle} aria-label={user ? 'sign out' : 'sign in'} disabled={!authReady}>
    <div class="avatar">
      {#if authReady}
        {#if user?.photoURL}
          <img src={user.photoURL} alt="" referrerpolicy="no-referrer" />
        {:else}
          👤
        {/if}
      {/if}
    </div>
    <span class="auth-label" class:redacted={!authReady}>{authReady ? (user ? user.displayName?.toLowerCase() ?? user.email : 'sign in') : 'sign in'}</span>
  </button>

  {#if open}
    <div class="dropdown">
      {#if user}
        <span class="dropdown-label">{user.displayName?.toLowerCase() ?? user.email}</span>
        <button onclick={() => { open = false; onSignOut() }}>sign out</button>
      {:else}
        <span class="dropdown-label">sign in with</span>
        <button onclick={() => signInWith('google')}>Google</button>
        <button onclick={() => signInWith('github')}>GitHub</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .auth-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .auth-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    color: var(--muted);
    transition: color 0.15s;
  }

  .auth-btn:hover {
    color: var(--text);
  }

  .auth-label {
    font-size: 0.875rem;
    margin-top: 0.25rem;
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .auth-label.redacted {
    color: transparent;
    background: var(--muted);
    border-radius: 3px;
    opacity: 0.3;
    user-select: none;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar img {
    width: 120%;
    height: 120%;
    object-fit: cover;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    min-width: 8rem;
    z-index: 10;
    overflow: hidden;
  }

  .dropdown-label {
    display: block;
    padding: 0.6rem 1rem 0.3rem;
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: lowercase;
  }

  .dropdown button {
    padding: 0.4rem 1rem 0.6rem;
    text-align: left;
    font-size: 0.875rem;
    color: var(--text);
    transition: background 0.1s;
  }

  .dropdown button:hover {
    background: var(--surface-hover);
  }
</style>

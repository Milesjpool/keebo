<script>
  const FINGER_MAP = {
    // Left pinky
    'q': { hand: 'left', finger: 'pinky' },
    'a': { hand: 'left', finger: 'pinky' },
    'z': { hand: 'left', finger: 'pinky' },
    // Left ring
    'w': { hand: 'left', finger: 'ring' },
    's': { hand: 'left', finger: 'ring' },
    'x': { hand: 'left', finger: 'ring' },
    // Left middle
    'e': { hand: 'left', finger: 'middle' },
    'd': { hand: 'left', finger: 'middle' },
    'c': { hand: 'left', finger: 'middle' },
    // Left index
    'r': { hand: 'left', finger: 'index' },
    'f': { hand: 'left', finger: 'index' },
    'v': { hand: 'left', finger: 'index' },
    't': { hand: 'left', finger: 'index' },
    'g': { hand: 'left', finger: 'index' },
    'b': { hand: 'left', finger: 'index' },
    // Thumb (space)
    ' ': { hand: 'thumb', finger: 'thumb' },
    // Right index
    'y': { hand: 'right', finger: 'index' },
    'h': { hand: 'right', finger: 'index' },
    'n': { hand: 'right', finger: 'index' },
    'u': { hand: 'right', finger: 'index' },
    'j': { hand: 'right', finger: 'index' },
    'm': { hand: 'right', finger: 'index' },
    // Right middle
    'i': { hand: 'right', finger: 'middle' },
    'k': { hand: 'right', finger: 'middle' },
    ',': { hand: 'right', finger: 'middle' },
    // Right ring
    'o': { hand: 'right', finger: 'ring' },
    'l': { hand: 'right', finger: 'ring' },
    '.': { hand: 'right', finger: 'ring' },
    // Right pinky
    'p': { hand: 'right', finger: 'pinky' },
    ';': { hand: 'right', finger: 'pinky' },
    "'": { hand: 'right', finger: 'pinky' },
    '\n': { hand: 'right', finger: 'pinky' },
  }

  // Heights (in rem) to give a natural hand silhouette
  const HEIGHTS = { pinky: 2.5, ring: 3.5, middle: 4, index: 3.25 }

  let { char } = $props()

  const info = $derived(char != null ? (FINGER_MAP[char.toLowerCase()] ?? null) : null)

  const LEFT  = ['pinky', 'ring', 'middle', 'index']
  const RIGHT = ['index', 'middle', 'ring', 'pinky']

  function active(hand, finger) {
    return info?.hand === hand && info?.finger === finger
  }
</script>

<div class="indicator">
  <div class="hand">
    {#each LEFT as f}
      <div class="finger" class:active={active('left', f)} style:height="{HEIGHTS[f]}rem"></div>
    {/each}
  </div>

  <div class="thumb" class:active={info?.hand === 'thumb'}></div>

  <div class="hand">
    {#each RIGHT as f}
      <div class="finger" class:active={active('right', f)} style:height="{HEIGHTS[f]}rem"></div>
    {/each}
  </div>
</div>

<style>
  .indicator {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .hand {
    display: flex;
    align-items: flex-end;
    gap: 0.2rem;
  }

  .finger {
    width: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 4px 4px 2px 2px;
    transition: background 0.1s, border-color 0.1s;
  }

  .thumb {
    width: 3.5rem;
    height: 1rem;
    border: 1px solid var(--border);
    border-radius: 3px;
    transition: background 0.1s, border-color 0.1s;
  }

  .finger.active,
  .thumb.active {
    background: var(--cursor-bg);
    border-color: var(--cursor-bg);
  }
</style>

<script>
  import Fingers from "./Fingers.svelte";
  import keymap from "../keymap.json";

  let { char } = $props();

  const info = $derived(
    char != null ? (keymap.fingerMap[char.toLowerCase()] ?? null) : null,
  );

  function hi(hand, finger) {
    if (!info) return false;
    if (info.hand === "thumb") return finger === "thumb";
    return info.hand === hand && info.finger === finger;
  }
</script>

{#if info}
<div class="indicator">
  <Fingers
    outline="var(--muted)"
    highlight="var(--finger)"
    leftPinky={hi("left", "pinky")}
    leftRing={hi("left", "ring")}
    leftMiddle={hi("left", "middle")}
    leftIndex={hi("left", "index")}
    leftThumb={hi("left", "thumb")}
    rightThumb={hi("right", "thumb")}
    rightIndex={hi("right", "index")}
    rightMiddle={hi("right", "middle")}
    rightRing={hi("right", "ring")}
    rightPinky={hi("right", "pinky")}
  />
</div>
{/if}

<style>
  .indicator {
    width: 240px;
  }
</style>

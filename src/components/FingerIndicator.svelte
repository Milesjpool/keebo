<script lang="ts">
  import Fingers from "./Fingers.svelte";
  import keymap from "../data/keymap.json";

  interface Props { char: string | null }
  let { char }: Props = $props();

  const fingerMap = keymap.fingerMap as Record<string, { hand: string; finger: string } | undefined>
  const info = $derived(
    char != null ? (fingerMap[char.toLowerCase()] ?? null) : null,
  );

  function hi(hand: string, finger: string) {
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

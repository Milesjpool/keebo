<script>
  import Fingers from "./Fingers.svelte";

  const FINGER_MAP = {
    q: { hand: "left", finger: "pinky" },
    a: { hand: "left", finger: "pinky" },
    z: { hand: "left", finger: "pinky" },
    w: { hand: "left", finger: "ring" },
    s: { hand: "left", finger: "ring" },
    x: { hand: "left", finger: "ring" },
    e: { hand: "left", finger: "middle" },
    d: { hand: "left", finger: "middle" },
    c: { hand: "left", finger: "middle" },
    r: { hand: "left", finger: "index" },
    f: { hand: "left", finger: "index" },
    v: { hand: "left", finger: "index" },
    t: { hand: "left", finger: "index" },
    g: { hand: "left", finger: "index" },
    b: { hand: "left", finger: "index" },
    " ": { hand: "thumb", finger: "thumb" },
    y: { hand: "right", finger: "index" },
    h: { hand: "right", finger: "index" },
    n: { hand: "right", finger: "index" },
    u: { hand: "right", finger: "index" },
    j: { hand: "right", finger: "index" },
    m: { hand: "right", finger: "index" },
    i: { hand: "right", finger: "middle" },
    k: { hand: "right", finger: "middle" },
    ",": { hand: "right", finger: "middle" },
    o: { hand: "right", finger: "ring" },
    l: { hand: "right", finger: "ring" },
    ".": { hand: "right", finger: "ring" },
    p: { hand: "right", finger: "pinky" },
    ";": { hand: "right", finger: "pinky" },
    "'": { hand: "right", finger: "pinky" },
    "\n": { hand: "right", finger: "pinky" },
  };

  let { char } = $props();

  const info = $derived(
    char != null ? (FINGER_MAP[char.toLowerCase()] ?? null) : null,
  );

  function hi(hand, finger) {
    if (!info) return false;
    if (info.hand === "thumb") return finger === "thumb";
    return info.hand === hand && info.finger === finger;
  }
</script>

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

<style>
  .indicator {
    width: 240px;
  }
</style>

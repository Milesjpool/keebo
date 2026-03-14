// Assonant / alliterative adjective + animal pairs (grouped by shared sound)
// Each group: adjectives and animals that pair well (alliteration or assonance)
const ASSONANT_GROUPS = [
  { adjectives: ['sleepy', 'eager', 'weary', 'meek', 'cheerful', 'feeble', 'gleeful'], animals: ['seal', 'eagle', 'beaver', 'weasel', 'lemur'] },
  { adjectives: ['calm', 'curious', 'clear', 'cold', 'clever', 'cosy', 'crafty'], animals: ['camel', 'crow', 'crane', 'coyote'] },
  { adjectives: ['bold', 'brisk', 'bright', 'brave', 'bouncy', 'bumbling'], animals: ['badger', 'beaver', 'butterfly', 'bison'] },
  { adjectives: ['frosty', 'fair', 'fluffy', 'fancy', 'fiery'], animals: ['fox', 'falcon', 'frog', 'flamingo'] },
  { adjectives: ['gentle', 'golden', 'good', 'grumpy', 'glad', 'grand', 'graceful'], animals: ['goat', 'goose', 'gull', 'gecko'] },
  { adjectives: ['happy', 'humble', 'high', 'hearty', 'helpful', 'honest', 'hasty'], animals: ['hare', 'hamster', 'hawk', 'hedgehog'] },
  { adjectives: ['jolly', 'jumpy', 'jazzy'], animals: ['jay', 'jaguar'] },
  { adjectives: ['kind', 'keen', 'kooky'], animals: ['kangaroo', 'kiwi', 'koala', 'kestrel'] },
  { adjectives: ['lazy', 'lucky', 'light', 'lively', 'lovely', 'loopy', 'lonely'], animals: ['llama', 'lynx', 'lark', 'lizard', 'leopard'] },
  { adjectives: ['mild', 'merry', 'mellow', 'modest', 'mischievous'], animals: ['mole', 'moose', 'magpie', 'meerkat'] },
  { adjectives: ['noble', 'nimble', 'neat', 'noisy'], animals: ['newt', 'narwhal'] },
  { adjectives: ['old', 'orange', 'odd'], animals: ['otter', 'owl'] },
  { adjectives: ['peaceful', 'proud', 'patient', 'plump', 'playful', 'plucky'], animals: ['puffin', 'peacock', 'panda', 'penguin', 'parrot', 'porcupine'] },
  { adjectives: ['quick', 'quiet', 'quirky', 'quaint'], animals: ['quail', 'quokka'] },
  { adjectives: ['red', 'rested', 'rosy', 'rough', 'royal', 'rowdy', 'restless'], animals: ['robin', 'raccoon', 'raven', 'reindeer'] },
  { adjectives: ['soft', 'sleepy', 'silly', 'sweet', 'swift', 'shy', 'steady'], animals: ['sloth', 'swan', 'squirrel', 'stork', 'skunk'] },
  { adjectives: ['timid', 'tame', 'tender', 'tiny', 'tired', 'tough'], animals: ['trout', 'tiger', 'tuna', 'tortoise', 'toucan'] },
  { adjectives: ['velvet', 'valiant'], animals: ['vole'] },
  { adjectives: ['warm', 'wily', 'wise', 'wild', 'weary', 'wobbly'], animals: ['whale', 'wolf', 'woodpecker'] },
  { adjectives: ['young', 'yawning'], animals: ['yak'] },
  { adjectives: ['zany', 'zesty'], animals: ['zebra'] },
] as const

const STORAGE_KEY = 'keebo:anon-name'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rollRandom(): string {
  const group = pick(ASSONANT_GROUPS)
  return `${pick(group.adjectives)} ${pick(group.animals)}`
}

export function getAnonName(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored.trim()) return stored.trim()
  } catch {
    /* ignore */
  }
  const name = rollRandom()
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    /* ignore */
  }
  return name
}

export function rollNewName(): string {
  const name = rollRandom()
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    /* ignore */
  }
  return name
}

export function setAnonName(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  try {
    localStorage.setItem(STORAGE_KEY, trimmed)
  } catch {
    /* ignore */
  }
}

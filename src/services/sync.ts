import type { Progress } from './types'
import { db } from './firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { mergeProgress } from './progress'

export function subscribeToProgress(
  uid: string,
  getLocal: () => Progress,
  onUpdate: (merged: Progress) => void
): () => void {
  const ref = doc(db, 'users', uid)
  let isFirstSnapshot = true
  return onSnapshot(ref, (snap) => {
    const remote = snap.exists() ? ((snap.data().progress ?? {}) as Progress) : {}
    const merged = mergeProgress(getLocal(), remote)
    onUpdate(merged)
    // Push local-only data on first snapshot (same behavior as fetchAndMerge)
    if (isFirstSnapshot) {
      isFirstSnapshot = false
      setDoc(ref, { progress: merged }, { merge: true })
    }
  })
}

export async function writeProgress(uid: string, progress: Progress): Promise<void> {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { progress }, { merge: true })
}

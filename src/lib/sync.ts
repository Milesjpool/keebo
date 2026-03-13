import type { Progress } from './types'
import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { mergeProgress } from './progress'

export async function fetchAndMerge(uid: string, localProgress: Progress): Promise<Progress> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const remote = snap.exists() ? ((snap.data().progress ?? {}) as Progress) : {}
  const merged = mergeProgress(localProgress, remote)
  await setDoc(ref, { progress: merged }, { merge: true })
  return merged
}

export async function writeProgress(uid: string, progress: Progress): Promise<void> {
  const ref = doc(db, 'users', uid)
  setDoc(ref, { progress }, { merge: true })
}

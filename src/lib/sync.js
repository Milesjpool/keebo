import { db } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { mergeProgress } from './progress.js'

export async function fetchAndMerge(uid, localProgress) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const remote = snap.exists() ? (snap.data().progress ?? {}) : {}
  const merged = mergeProgress(localProgress, remote)
  await setDoc(ref, { progress: merged }, { merge: true })
  return merged
}

export async function writeProgress(uid, progress) {
  const ref = doc(db, 'users', uid)
  setDoc(ref, { progress }, { merge: true })
}

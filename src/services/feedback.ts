import { db } from './firebase'
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'

export interface FeedbackContext {
  screen?: string
  lessonId?: string
  groupIdx?: number
  flatIdx?: number
}

export async function submitFeedback(data: {
  text: string
  userId?: string
  email?: string
  screen?: string
  lessonId?: string
  groupIdx?: number
  flatIdx?: number
}): Promise<void> {
  const clean = Object.fromEntries(
    Object.entries({ ...data, createdAt: serverTimestamp() }).filter(([, v]) => v !== undefined)
  )
  await addDoc(collection(db, 'feedback'), clean)
}

export async function submitInterest(feature: string, userId?: string): Promise<void> {
  if (!userId) return
  const ref = doc(db, 'interest', `${userId}_${feature}`)
  await setDoc(ref, { feature, userId, createdAt: serverTimestamp() })
}

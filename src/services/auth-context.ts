import { setContext, getContext } from 'svelte'
import type { User } from 'firebase/auth'
import type { Difficulty } from './types'

export interface AuthContext {
  readonly user: User | null
  readonly authReady: boolean
  readonly difficulty: Difficulty
  readonly difficultyLocked: boolean
  onSignIn(p: string): Promise<void>
  onSignOut(): Promise<void>
  onLinkProvider(p: string): Promise<void>
  onDeleteAccount(): Promise<void>
  onDeleteProgress(): void
  onDifficultyChange(d: Difficulty): void
}

const AUTH_KEY = Symbol('auth-context')

export function setAuthContext(ctx: AuthContext) {
  setContext(AUTH_KEY, ctx)
}

export function getAuthContext(): AuthContext {
  return getContext<AuthContext>(AUTH_KEY)
}

import { createContext } from 'react'

export type AuthUser = {
  email: string
}

export type AuthState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; token: string; user: AuthUser }

export type AuthContextValue = {
  state: AuthState
  login(email: string, password: string): Promise<void>
  register(email: string, password: string): Promise<void>
  logout(): void
}

export const AuthContext = createContext<AuthContextValue | null>(null)


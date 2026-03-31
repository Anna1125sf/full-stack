import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { http } from '../api/http'
import type { AuthState } from './AuthContext'
import { AuthContext } from './AuthContext'
import { authTokenStore } from './authTokenStore'

type TokenOut = { access_token: string; token_type: 'bearer' }

export function AuthProvider(props: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ status: 'anonymous' })

  useEffect(() => {
    const token = authTokenStore.get()
    if (!token) return
    // У нас нет /me, поэтому храним только token; email восстановим после логина/регистрации
    setState({ status: 'authenticated', token, user: { email: 'unknown' } })
  }, [])

  const value = useMemo(() => {
    const login = async (email: string, password: string) => {
      const res = await http.post<TokenOut>('/auth/login', { email, password })
      authTokenStore.set(res.data.access_token)
      setState({
        status: 'authenticated',
        token: res.data.access_token,
        user: { email },
      })
    }

    const register = async (email: string, password: string) => {
      await http.post('/auth/register', { email, password })
      await login(email, password)
    }

    const logout = () => {
      authTokenStore.clear()
      setState({ status: 'anonymous' })
    }

    return { state, login, register, logout }
  }, [state])

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}


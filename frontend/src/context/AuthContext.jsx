import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const [, payloadB64] = token.split('.')
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    const payload = t ? parseJwt(t) : null
    return payload ? { id: payload.sub, email: payload.email, name: payload.name } : null
  })

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token')
      setUser(null)
      return
    }

    localStorage.setItem('token', token)
    const payload = parseJwt(token)
    setUser(payload ? { id: payload.sub, email: payload.email, name: payload.name } : null)
  }, [token])

  const value = useMemo(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      async register({ name, email, password }) {
        const res = await api.post('/auth/register', { name, email, password })
        setToken(res.data.token)
        return res.data
      },
      async login({ email, password }) {
        const res = await api.post('/auth/login', { email, password })
        setToken(res.data.token)
        return res.data
      },
      logout() {
        setToken(null)
      },
    }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


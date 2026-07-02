import { useState, useCallback, useEffect } from 'react'
import { login as authLogin, validateToken, getStoredToken, clearToken } from '../engine/auth'
import { logEvent } from '../engine/auditLog'

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>(() => {
    const token = getStoredToken()
    const payload = validateToken(token)
    if (payload) {
      return { isAuthenticated: true, username: payload.sub, error: null }
    }
    if (token) {
      // Había token pero es inválido/expirado
      logEvent('SESSION_EXPIRED', null)
      clearToken()
    }
    return { isAuthenticated: false, username: null, error: null }
  })

  const login = useCallback(async (username: string, password: string) => {
    const result = await authLogin(username, password)
    if (result.success) {
      logEvent('LOGIN_SUCCESS', username)
      setState({ isAuthenticated: true, username, error: null })
    } else {
      logEvent('LOGIN_FAILURE', null, { attempted: username })
      setState(prev => ({ ...prev, isAuthenticated: false, error: result.error ?? 'UNKNOWN' }))
    }
  }, [])

  const logout = useCallback(() => {
    const username = state.username
    clearToken()
    logEvent('LOGOUT', username)
    setState({ isAuthenticated: false, username: null, error: null })
  }, [state.username])

  return { ...state, login, logout }
}

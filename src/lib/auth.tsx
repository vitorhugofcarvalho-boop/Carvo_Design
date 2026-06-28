/**
 * Auth — autenticação via Supabase Auth.
 *
 * O Supabase gerencia:
 * - Hash e salt de senha (server-side, bcrypt-style)
 * - Sessão com JWT + refresh token automático
 * - Persistência da sessão em localStorage (feita pelo client)
 *
 * Para configurar:
 * 1. Supabase Dashboard → Authentication → Settings → habilitar "Email + Password"
 * 2. Supabase Dashboard → Authentication → Users → "Add User" para criar admin
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; erro?: string }>
  signup: (email: string, password: string) => Promise<{ ok: boolean; erro?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Restaura sessão existente ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Escuta mudanças de auth em tempo real (login/logout em outras abas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Escuta sessão vinda da extensão (modo embedded)
    function handleMessage(event: MessageEvent) {
      if (
        event.data?.source === 'prospectos-extension' &&
        event.data?.type === 'SET_SESSION' &&
        event.data?.session &&
        supabase
      ) {
        const sessionData = event.data.session as Session
        supabase.auth.setSession(sessionData).then(({ data, error }) => {
          if (!error && data.session) {
            setUser(data.session.user)
          }
        })
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { ok: false, erro: 'Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        return { ok: false, erro: 'E-mail ou senha inválidos.' }
      }
      return { ok: false, erro: error.message }
    }

    return { ok: true }
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { ok: false, erro: 'Supabase não configurado.' }
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (error.message.includes('already')) {
        return { ok: false, erro: 'Este e-mail já está cadastrado.' }
      }
      return { ok: false, erro: error.message }
    }

    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
  }), [user, isLoading, login, signup, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

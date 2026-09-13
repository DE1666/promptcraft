'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

type AuthContextType = {
  user: User | null
  loading: boolean
  plan: 'free' | 'pro' | 'enterprise'
  usageCount: number
  usageLimit: number
  usageRemaining: number
  isLimited: boolean
  refreshUsage: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  plan: 'free',
  usageCount: 0,
  usageLimit: 5,
  usageRemaining: 5,
  isLimited: false,
  refreshUsage: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [usageCount, setUsageCount] = useState(0)
  const limit = plan === 'free' ? 5 : Infinity

  const refreshUsage = async () => {
    if (!user) { setUsageCount(0); return }
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('prompt_usage')
        .select('count, plan')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()
      if (data) {
        setUsageCount(data.count)
        setPlan(data.plan as 'free' | 'pro' | 'enterprise')
      } else {
        setUsageCount(0)
        setPlan('free')
      }
    } catch {
      setUsageCount(0)
    }
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null)
        if (!session?.user) setUsageCount(0)
      })()
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => { if (user) refreshUsage() }, [user])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsageCount(0)
    setPlan('free')
  }

  const incrementUsage = async () => {
    if (!user) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('prompt_usage')
        .select('id, count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()
      if (existing) {
        const newCount = existing.count + 1
        await supabase.from('prompt_usage').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', existing.id)
        setUsageCount(newCount)
      } else {
        await supabase.from('prompt_usage').insert({ user_id: user.id, date: today, count: 1, plan })
        setUsageCount(1)
      }
    } catch { /* ignore */ }
  }

  // Expose incrementUsage through a ref-like pattern via context value
  const value: AuthContextType = {
    user,
    loading,
    plan,
    usageCount,
    usageLimit: limit,
    usageRemaining: Math.max(0, limit - usageCount),
    isLimited: plan === 'free' && usageCount >= 5,
    refreshUsage,
    signInWithGoogle,
    signOut,
  }
  // Attach incrementUsage to the context value via a cast
  ;(value as AuthContextType & { incrementUsage: () => Promise<void> }).incrementUsage = incrementUsage

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthWithIncrement() {
  const auth = useAuth() as AuthContextType & { incrementUsage?: () => Promise<void> }
  return { ...auth, incrementUsage: auth.incrementUsage ?? (async () => {}) }
}

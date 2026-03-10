'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from './supabase'
import { User } from '@supabase/supabase-js'

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  role: 'citizen' | 'owner' | 'admin'
  phone: string | null
  avatar_url: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setProfile(data)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signOut }
}

export function useRooms(filters?: {
  city?: string
  room_type?: string
  min_price?: number
  max_price?: number
  is_available?: boolean
  owner_id?: string
}) {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('rooms')
      .select(`*, room_images(*), users(full_name, email, phone, avatar_url)`)
      .order('created_at', { ascending: false })

    if (filters?.city) query = query.eq('city', filters.city)
    if (filters?.room_type) query = query.eq('room_type', filters.room_type)
    if (filters?.min_price) query = query.gte('rent_price', filters.min_price)
    if (filters?.max_price) query = query.lte('rent_price', filters.max_price)
    if (filters?.is_available !== undefined) query = query.eq('is_available', filters.is_available)
    if (filters?.owner_id) query = query.eq('owner_id', filters.owner_id)

    const { data, error } = await query
    if (!error && data) setRooms(data)
    setLoading(false)
  }, [filters?.city, filters?.room_type, filters?.min_price, filters?.max_price, filters?.is_available, filters?.owner_id, supabase])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  return { rooms, loading, refetch: fetchRooms }
}

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!userId) return
    supabase.from('favorites').select('room_id').eq('user_id', userId).then(({ data }) => {
      if (data) setFavorites(data.map(f => f.room_id))
    })
  }, [userId, supabase])

  const toggleFavorite = async (roomId: string) => {
    if (!userId) return
    if (favorites.includes(roomId)) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('room_id', roomId)
      setFavorites(prev => prev.filter(id => id !== roomId))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, room_id: roomId })
      setFavorites(prev => [...prev, roomId])
    }
  }

  return { favorites, toggleFavorite }
}

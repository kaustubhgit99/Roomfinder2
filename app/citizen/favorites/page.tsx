'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomGridSkeleton } from '@/components/rooms/RoomSkeleton'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!user) return
    supabase
      .from('favorites')
      .select('room_id, rooms(*, room_images(*), users(full_name, email, phone))')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setRooms(data.map((f: any) => f.rooms).filter(Boolean))
        setLoading(false)
      })
  }, [user, supabase])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-4xl font-display font-bold">Your Favorites</h1>
              <p className="text-muted-foreground">{rooms.length} saved room{rooms.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </motion.div>

        {!user ? (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">Sign in to view favorites</h3>
            <Link href="/auth/login"><Button className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">Sign In</Button></Link>
          </div>
        ) : loading ? (
          <RoomGridSkeleton count={6} />
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, i) => <RoomCard key={room.id} room={room} userId={user?.id} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-sm mb-6">Start exploring rooms and save the ones you love.</p>
            <Link href="/citizen"><Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">Browse Rooms</Button></Link>
          </div>
        )}
      </div>
    </div>
  )
}

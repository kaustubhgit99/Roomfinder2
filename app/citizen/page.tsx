'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomFilters } from '@/components/rooms/RoomFilters'
import { RoomGridSkeleton } from '@/components/rooms/RoomSkeleton'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { Building2 } from 'lucide-react'

function CitizenContent() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  const initialCity = searchParams.get('city') || ''

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*, room_images(*), users(full_name, email, phone)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setRooms(data)
          // Apply initial city filter
          if (initialCity) {
            setFiltered(data.filter((r: any) => r.city === initialCity))
          } else {
            setFiltered(data)
          }
        }
        setLoading(false)
      })
  }, [supabase, initialCity])

  const handleFiltersChange = (filters: any) => {
    let result = [...rooms]
    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(s) ||
        r.location.toLowerCase().includes(s) ||
        r.city.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s)
      )
    }
    if (filters.city) result = result.filter(r => r.city === filters.city)
    if (filters.room_type) result = result.filter(r => r.room_type === filters.room_type)
    if (filters.min_price) result = result.filter(r => r.rent_price >= Number(filters.min_price))
    if (filters.max_price) result = result.filter(r => r.rent_price <= Number(filters.max_price))
    if (filters.is_available === 'true') result = result.filter(r => r.is_available)
    if (filters.is_available === 'false') result = result.filter(r => !r.is_available)
    setFiltered(result)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Find Your Room</h1>
          <p className="text-muted-foreground">
            {filtered.length} room{filtered.length !== 1 ? 's' : ''} available
            {initialCity ? ` in ${initialCity}` : ''}
          </p>
        </motion.div>

        <div className="mb-6">
          <RoomFilters onFiltersChange={handleFiltersChange} />
        </div>

        {loading ? (
          <RoomGridSkeleton count={9} />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((room, i) => (
              <RoomCard key={room.id} room={room} userId={user?.id} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
            <p className="text-sm">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CitizenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CitizenContent />
    </Suspense>
  )
}

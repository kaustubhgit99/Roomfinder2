'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Home, Eye, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    fetchRooms()
  }, [user])

  const fetchRooms = async () => {
    if (!user) return
    const { data } = await supabase
      .from('rooms')
      .select('*, room_images(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setRooms(data)
    setLoading(false)
  }

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this room listing?')) return
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(prev => prev.filter(r => r.id !== id))
    toast({ title: 'Room deleted successfully' })
  }

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('rooms').update({ is_available: !current }).eq('id', id)
    setRooms(prev => prev.map(r => r.id === id ? { ...r, is_available: !current } : r))
    toast({ title: `Room marked as ${!current ? 'available' : 'occupied'}` })
  }

  const stats = [
    { label: 'Total Listings', value: rooms.length, icon: Home, color: 'text-blue-500' },
    { label: 'Available', value: rooms.filter(r => r.is_available).length, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Occupied', value: rooms.filter(r => !r.is_available).length, icon: Home, color: 'text-orange-500' },
    { label: 'Total Value', value: formatPrice(rooms.reduce((s, r) => s + r.rent_price, 0)), icon: DollarSign, color: 'text-purple-500' },
  ]

  if (!user || profile?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Navbar />
        <h2 className="text-2xl font-display font-bold">Owner access required</h2>
        <Link href="/auth/login"><Button>Sign In as Owner</Button></Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your room listings</p>
          </div>
          <Link href="/owner/add-room">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Room
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-5 border border-border/50"
            >
              <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Listings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">My Listings</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="mb-4">No rooms listed yet</p>
              <Link href="/owner/add-room">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">Add Your First Room</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">City</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Listed</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium line-clamp-1 max-w-48">{room.title}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{room.room_type}</div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-muted-foreground">{room.city}</td>
                      <td className="px-5 py-4 font-semibold text-orange-500">{formatPrice(room.rent_price)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleAvailability(room.id, room.is_available)}>
                          <Badge variant={room.is_available ? 'success' : 'warning'} className="cursor-pointer hover:opacity-80 transition-opacity">
                            {room.is_available ? 'Available' : 'Occupied'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground text-xs">{formatDate(room.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/room/${room.id}`}>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/owner/edit-room/${room.id}`}>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-blue-500" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

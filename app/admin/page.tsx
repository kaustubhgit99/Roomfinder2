'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Home, Trash2, Shield, AlertCircle, TrendingUp, Eye } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatDate, formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const fetchData = async () => {
    const [usersRes, roomsRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('rooms').select('*, users(full_name, email), room_images(*)').order('created_at', { ascending: false }),
    ])
    if (usersRes.data) setUsers(usersRes.data)
    if (roomsRes.data) setRooms(roomsRes.data)
    setLoading(false)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await supabase.from('users').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
    toast({ title: 'User removed' })
  }

  const deleteRoom = async (id: string) => {
    if (!confirm('Remove this room listing?')) return
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(prev => prev.filter(r => r.id !== id))
    toast({ title: 'Room removed' })
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Owners', value: users.filter(u => u.role === 'owner').length, icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Citizens', value: users.filter(u => u.role === 'citizen').length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Rooms', value: rooms.length, icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-display font-bold">Admin Access Required</h2>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Platform overview and moderation tools</p>
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
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-card border border-border/50">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" /> Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2">
              <Home className="w-4 h-4" /> Rooms ({rooms.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium hidden sm:table-cell">Phone</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium">{u.full_name || 'Unknown'}</div>
                              <div className="text-muted-foreground text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={u.role === 'admin' ? 'default' : u.role === 'owner' ? 'warning' : 'secondary'} className="capitalize">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{u.phone || '—'}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs hidden md:table-cell">{formatDate(u.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Room</th>
                      <th className="px-5 py-3 font-medium hidden sm:table-cell">Owner</th>
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
                          <div className="font-medium line-clamp-1 max-w-36">{room.title}</div>
                          <div className="text-muted-foreground text-xs">{room.city} • {room.room_type}</div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{room.users?.full_name || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-orange-500">{formatPrice(room.rent_price)}</td>
                        <td className="px-5 py-4">
                          <Badge variant={room.is_available ? 'success' : 'warning'}>
                            {room.is_available ? 'Available' : 'Occupied'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-xs hidden md:table-cell">{formatDate(room.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/room/${room.id}`}>
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => deleteRoom(room.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

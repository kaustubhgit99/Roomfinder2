'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Bed, Phone, Mail, Heart, ArrowLeft, CheckCircle, XCircle,
  Wifi, Car, Flame, Shield, Star, Share2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth, useFavorites } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user?.id)
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*, room_images(*), users(id, full_name, email, phone, avatar_url)')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        setRoom(data)
        setLoading(false)
      })
  }, [params.id, supabase])

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!room) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Navbar />
      <h2 className="text-2xl font-display font-bold">Room not found</h2>
      <Link href="/citizen"><Button>Browse Rooms</Button></Link>
    </div>
  )

  const images = room.room_images || []
  const isFav = favorites.includes(room.id)

  const prevImg = () => setCurrentImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setCurrentImg(i => (i + 1) % images.length)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to listings</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-muted">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImg]?.url}
                      alt={room.title}
                      fill
                      className="object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_: any, i: number) => (
                            <button key={i} onClick={() => setCurrentImg(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-white w-4' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                    <span className="text-6xl">🏠</span>
                  </div>
                )}

                <div className="absolute top-4 left-4">
                  <Badge variant={room.is_available ? 'success' : 'destructive'} className="font-semibold">
                    {room.is_available ? '✓ Available' : '✗ Occupied'}
                  </Badge>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  {user && (
                    <button
                      onClick={() => toggleFavorite(room.id)}
                      className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'text-red-500' : 'text-white/70 hover:text-red-400'}`}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img: any, i: number) => (
                    <button key={img.id} onClick={() => setCurrentImg(i)} className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 transition-all ${i === currentImg ? 'ring-2 ring-orange-500' : 'opacity-60 hover:opacity-100'}`}>
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">{room.title}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{room.location}, {room.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">{formatPrice(room.rent_price)}</div>
                  <div className="text-muted-foreground text-sm">/month</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl text-sm">
                  <Bed className="w-4 h-4 text-orange-500" /> {room.num_beds} Bed{room.num_beds > 1 ? 's' : ''}
                </div>
                <div className="px-3 py-1.5 bg-muted rounded-xl text-sm">{room.room_type}</div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  Listed {formatDate(room.created_at)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-display font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{room.description}</p>
              </div>

              {room.amenities?.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Owner card + actions */}
          <div className="space-y-4">
            {/* Owner */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-display font-semibold text-lg mb-4">Owner Details</h3>
              {room.users ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                      {room.users.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold">{room.users.full_name}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" /> Verified Owner
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {room.users.phone && (
                      <a href={`tel:${room.users.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-orange-500/10 transition-colors group">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{room.users.phone}</span>
                      </a>
                    )}
                    <a href={`mailto:${room.users.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-orange-500/10 transition-colors group">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium truncate">{room.users.email}</span>
                    </a>
                  </div>

                  <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                    Contact Owner
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Owner info not available</p>
              )}
            </motion.div>

            {/* Quick info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 border border-border/50 space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Room Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{room.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beds</span>
                  <span className="font-medium">{room.num_beds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{room.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${room.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
                    {room.is_available ? 'Available' : 'Occupied'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-bold text-orange-500">{formatPrice(room.rent_price)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

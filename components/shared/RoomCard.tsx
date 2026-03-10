'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Bed, Heart, Star, Wifi, Wind, Car } from 'lucide-react'
import type { Room } from '@/lib/supabase'
import { formatPrice, getImageUrl } from '@/lib/utils'

interface RoomCardProps {
  room: Room
  isFavorited?: boolean
  onToggleFavorite?: (roomId: string) => void
  index?: number
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi size={12} />,
  'AC': <Wind size={12} />,
  'Parking': <Car size={12} />,
}

export default function RoomCard({ room, isFavorited = false, onToggleFavorite, index = 0 }: RoomCardProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0]

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorited(!favorited)
    onToggleFavorite?.(room.id)
  }

  const roomTypeLabel: Record<string, string> = {
    single: 'Single', double: 'Double', studio: 'Studio', apartment: 'Apartment', shared: 'Shared'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/room/${room.id}`} className="block group">
        <div className="glass-card overflow-hidden">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-slate-800">
            {primaryImage ? (
              <img
                src={getImageUrl(primaryImage.image_url)}
                alt={room.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                <span className="text-slate-500 text-4xl">🏠</span>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${
                room.is_available
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {room.is_available ? '✓ Available' : '✗ Occupied'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {roomTypeLabel[room.room_type] || room.room_type}
              </span>
            </div>

            {/* Favorite */}
            <button
              onClick={handleFavorite}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                favorited
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-black/30 text-white hover:bg-rose-500/50'
              }`}
            >
              <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
            </button>

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <span className="text-white font-display font-bold text-lg">
                {formatPrice(room.rent_price)}
              </span>
              <span className="text-slate-300 text-xs">/month</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-semibold text-base leading-tight mb-1 group-hover:text-sky-300 transition-colors line-clamp-1">
              {room.title}
            </h3>

            <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
              <MapPin size={12} className="text-sky-400 shrink-0" />
              <span className="line-clamp-1">{room.location}, {room.city}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
              <span className="flex items-center gap-1">
                <Bed size={12} className="text-sky-400" />
                {room.num_beds} {room.num_beds === 1 ? 'Bed' : 'Beds'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <Star size={12} className="text-amber-400" />
              <span>4.{Math.floor(Math.random() * 5) + 3}</span>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 4).map(amenity => (
                  <span
                    key={amenity}
                    className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1"
                  >
                    {amenityIcons[amenity] || null}
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/30">
                    +{room.amenities.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

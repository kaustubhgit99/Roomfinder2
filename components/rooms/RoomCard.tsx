'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Heart, Star, Wifi, Car, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/lib/hooks'

interface RoomCardProps {
  room: any
  userId?: string
  index?: number
}

export function RoomCard({ room, userId, index = 0 }: RoomCardProps) {
  const { favorites, toggleFavorite } = useFavorites(userId)
  const isFav = favorites.includes(room.id)
  const primaryImage = room.room_images?.find((img: any) => img.is_primary) || room.room_images?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="room-card group"
    >
      <div className="rounded-2xl overflow-hidden glass-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={room.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <span className="text-4xl">🏠</span>
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={room.is_available ? 'success' : 'destructive'} className="text-xs font-semibold">
              {room.is_available ? '✓ Available' : 'Occupied'}
            </Badge>
          </div>

          {/* Favorite button */}
          {userId && (
            <button
              onClick={(e) => { e.preventDefault(); toggleFavorite(room.id) }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'text-red-500' : 'text-white/70 hover:text-red-400'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Image count */}
          {room.room_images?.length > 1 && (
            <div className="absolute bottom-3 right-3 glass text-white text-xs px-2 py-1 rounded-full">
              +{room.room_images.length - 1} photos
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display font-semibold text-foreground line-clamp-1 text-base group-hover:text-orange-500 transition-colors">
                {room.title}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                <MapPin className="w-3 h-3 text-orange-400" />
                <span className="line-clamp-1">{room.location}, {room.city}</span>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-orange-500 font-bold text-base">{formatPrice(room.rent_price)}</div>
              <div className="text-muted-foreground text-xs">/month</div>
            </div>
          </div>

          {/* Room type & beds */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {room.num_beds} Bed{room.num_beds > 1 ? 's' : ''}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
            <span>{room.room_type}</span>
          </div>

          {/* Amenity icons */}
          {room.amenities?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {room.amenities.slice(0, 4).map((amenity: string) => (
                <span key={amenity} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  +{room.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Owner */}
          {room.users && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 pt-2 border-t border-border/50">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                {room.users.full_name?.charAt(0) || '?'}
              </div>
              <span>{room.users.full_name || 'Owner'}</span>
            </div>
          )}

          <Link href={`/room/${room.id}`}>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 text-sm h-9">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

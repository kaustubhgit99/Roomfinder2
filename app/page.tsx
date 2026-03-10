'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, MapPin, Building2, Shield, Star, ArrowRight, Home, Users, TrendingUp, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomGridSkeleton } from '@/components/rooms/RoomSkeleton'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [featuredRooms, setFeaturedRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*, room_images(*), users(full_name, email, phone)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setFeaturedRooms(data)
        setLoadingRooms(false)
      })
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchCity) params.set('city', searchCity)
    router.push(`/citizen?${params.toString()}`)
  }

  const stats = [
    { label: 'Rooms Listed', value: '2,400+', icon: Home },
    { label: 'Happy Tenants', value: '1,800+', icon: Users },
    { label: 'Cities Covered', value: '20+', icon: MapPin },
    { label: 'Verified Owners', value: '600+', icon: Shield },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/80 text-sm font-medium mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Find Your Perfect Home Today
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-bold text-white mb-6 leading-tight"
          >
            Discover Your{' '}
            <span className="gradient-text">Dream Room</span>{' '}
            Effortlessly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-white/60 mb-10 max-w-2xl mx-auto"
          >
            Browse thousands of verified rooms, connect with trusted owners, and find your perfect home in minutes.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                list="cities"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                placeholder="Search by city..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl glass text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-orange-500/50 text-base"
              />
              <datalist id="cities">
                {CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <Button
              onClick={handleSearch}
              className="h-14 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-base font-semibold border-0 shadow-lg shadow-orange-500/25 whitespace-nowrap"
            >
              <Search className="w-5 h-5 mr-2" /> Search Rooms
            </Button>
          </motion.div>

          {/* Popular cities */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap gap-2 justify-center"
          >
            <span className="text-white/40 text-sm">Popular:</span>
            {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'].map(city => (
              <button
                key={city}
                onClick={() => { setSearchCity(city); router.push(`/citizen?city=${city}`) }}
                className="text-white/60 hover:text-orange-400 text-sm transition-colors"
              >
                {city}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 text-white/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center glass-card rounded-2xl p-6 border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-3xl font-display font-bold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-orange-500 font-medium mb-2 text-sm uppercase tracking-wider"
              >
                Featured Listings
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-display font-bold"
              >
                Rooms You'll Love
              </motion.h2>
            </div>
            <Link href="/citizen">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingRooms ? (
            <RoomGridSkeleton count={6} />
          ) : featuredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} userId={user?.id} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No rooms listed yet. Be the first to add one!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/citizen">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                Browse All Rooms <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-display font-bold mb-4"
            >
              How RoomFinder Works
            </motion.h2>
            <p className="text-muted-foreground">Find your perfect room in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search & Filter', desc: 'Browse thousands of rooms with powerful filters by city, price, and type.', icon: Search },
              { step: '02', title: 'View Details', desc: 'Explore photos, amenities, and pricing. Save your favorites for later.', icon: Building2 },
              { step: '03', title: 'Connect & Move In', desc: 'Contact the owner directly and secure your perfect room today.', icon: Star },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center group"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-orange-500 flex items-center justify-center text-xs font-bold text-orange-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-display font-bold text-white mb-4">
                Ready to Find Your Room?
              </h2>
              <p className="text-white/80 mb-8 text-lg">
                Join thousands of happy tenants who found their perfect home on RoomFinder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/citizen">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    Browse Rooms
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-orange-500" />
          <span className="font-display font-bold text-foreground">RoomFinder</span>
        </div>
        <p>© 2024 RoomFinder. Built for students and city explorers.</p>
      </footer>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Home, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(data)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(data)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/auth/login'
    if (user.role === 'admin') return '/admin'
    if (user.role === 'owner') return '/owner'
    return '/citizen'
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all">
              <Home size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-white">
              Room<span className="gradient-text">Finder</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/citizen" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Browse Rooms
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {user.role === 'admin' ? <Shield size={14} /> : <LayoutDashboard size={14} />}
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">{user.full_name?.split(' ')[0] || 'User'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                    user.role === 'owner' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-sky-500/20 text-sky-300'
                  }`}>{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-sky-500/10"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/citizen" className="block text-slate-400 hover:text-white transition-colors text-sm py-2">Browse Rooms</Link>
              {user ? (
                <>
                  <Link href={getDashboardLink()} className="block text-slate-400 hover:text-white transition-colors text-sm py-2">Dashboard</Link>
                  <button onClick={handleLogout} className="block text-slate-400 hover:text-white transition-colors text-sm py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block text-slate-400 hover:text-white transition-colors text-sm py-2">Login</Link>
                  <Link href="/auth/signup" className="block btn-primary text-sm text-center py-2">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

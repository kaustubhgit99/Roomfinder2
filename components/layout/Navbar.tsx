'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Menu, X, Moon, Sun, User, LogOut, LayoutDashboard, Home, Heart, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, profile, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin'
    if (profile?.role === 'owner') return '/owner'
    return '/citizen'
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">RoomFinder</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-orange-400 ${pathname === '/' ? 'text-orange-400' : 'text-white/80'}`}>
              Home
            </Link>
            <Link href="/citizen" className={`text-sm font-medium transition-colors hover:text-orange-400 ${pathname.startsWith('/citizen') ? 'text-orange-400' : 'text-white/80'}`}>
              Browse Rooms
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-white text-sm font-medium hover:bg-white/15 transition-all">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="hidden sm:block max-w-24 truncate">{profile?.full_name || 'Account'}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 glass-card border-white/10">
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-sm font-medium">{profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {profile?.role === 'citizen' && (
                        <DropdownMenuItem asChild>
                          <Link href="/citizen/favorites" className="flex items-center gap-2 cursor-pointer">
                            <Heart className="w-4 h-4" /> Favorites
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {profile?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-400 cursor-pointer flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              <Link href="/" className="py-2 px-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link href="/citizen" className="py-2 px-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Browse Rooms
              </Link>
              {user && (
                <Link href={getDashboardLink()} className="py-2 px-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

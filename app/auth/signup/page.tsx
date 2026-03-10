'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Building2, Loader2, User, Home } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'citizen' | 'owner'>('citizen')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (error) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }

    if (data.user) {
      // Insert into users table
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        phone: phone || null,
      })

      toast({ title: 'Account created! 🎉', description: 'Welcome to RoomFinder!' })
      if (role === 'owner') router.push('/owner')
      else router.push('/citizen')
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl">RoomFinder</span>
            </Link>
            <h1 className="text-3xl font-display font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Join thousands finding their perfect home</p>
          </div>

          {/* Role selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">I want to...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  role === 'citizen'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-border hover:border-orange-300 hover:bg-orange-500/5'
                }`}
              >
                <User className={`w-6 h-6 mb-2 ${role === 'citizen' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <div className={`font-semibold text-sm ${role === 'citizen' ? 'text-orange-500' : ''}`}>Find a Room</div>
                <div className="text-xs text-muted-foreground mt-0.5">Browse & rent rooms</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  role === 'owner'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-border hover:border-orange-300 hover:bg-orange-500/5'
                }`}
              >
                <Home className={`w-6 h-6 mb-2 ${role === 'owner' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <div className={`font-semibold text-sm ${role === 'owner' ? 'text-orange-500' : ''}`}>List a Room</div>
                <div className="text-xs text-muted-foreground mt-0.5">Post & manage rooms</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

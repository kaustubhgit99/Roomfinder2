'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/rooms/ImageUpload'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES, AMENITIES_LIST } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function AddRoomPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    rent_price: '',
    location: '',
    city: '',
    room_type: '',
    num_beds: '1',
    is_available: true,
    amenities: [] as string[],
  })

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase.from('rooms').insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      rent_price: Number(form.rent_price),
      location: form.location,
      city: form.city,
      room_type: form.room_type,
      num_beds: Number(form.num_beds),
      is_available: form.is_available,
      amenities: form.amenities,
    }).select().single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }

    setCreatedRoomId(data.id)
    toast({ title: 'Room created! 🎉', description: 'Now add some photos.' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-3xl mx-auto px-4 py-8">
        <Link href="/owner" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-display font-bold mb-2">Add New Room</h1>
          <p className="text-muted-foreground mb-8">Fill in the details below to list your room</p>

          {!createdRoomId ? (
            <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-2xl p-6 border border-border/50">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-3">Basic Information</h3>
                <div className="space-y-1.5">
                  <Label>Room Title *</Label>
                  <Input placeholder="e.g. Cozy Studio near MG Road" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Description *</Label>
                  <Textarea placeholder="Describe your room in detail..." rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-3">Location</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Area / Street *</Label>
                    <Input placeholder="e.g. Koramangala, 5th Block" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City *</Label>
                    <Select value={form.city} onValueChange={v => setForm({...form, city: v})}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-3">Room Details</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Room Type *</Label>
                    <Select value={form.room_type} onValueChange={v => setForm({...form, room_type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>No. of Beds *</Label>
                    <Input type="number" min="1" max="10" value={form.num_beds} onChange={e => setForm({...form, num_beds: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Rent (₹) *</Label>
                    <Input type="number" min="0" placeholder="e.g. 12000" value={form.rent_price} onChange={e => setForm({...form, rent_price: e.target.value})} required />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                  <Switch checked={form.is_available} onCheckedChange={v => setForm({...form, is_available: v})} />
                  <div>
                    <Label className="cursor-pointer">Available for Rent</Label>
                    <p className="text-xs text-muted-foreground">Toggle off if currently occupied</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_LIST.map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <Checkbox
                        checked={form.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !form.city || !form.room_type}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {loading ? 'Creating...' : 'Create Room Listing'}
              </Button>
            </form>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Room Created!</h2>
                <p className="text-muted-foreground">Now add photos to make your listing stand out</p>
              </div>
              <ImageUpload
                roomId={createdRoomId}
                onUploadComplete={() => {
                  toast({ title: 'Images saved!' })
                }}
              />
              <div className="flex gap-3 mt-6">
                <Link href="/owner" className="flex-1">
                  <Button variant="outline" className="w-full">Go to Dashboard</Button>
                </Link>
                <Link href={`/room/${createdRoomId}`} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">View Listing</Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

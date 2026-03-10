'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
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

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [room, setRoom] = useState<any>(null)

  const [form, setForm] = useState({
    title: '', description: '', rent_price: '', location: '',
    city: '', room_type: '', num_beds: '1', is_available: true, amenities: [] as string[],
  })

  useEffect(() => {
    supabase.from('rooms').select('*, room_images(*)').eq('id', params.id).single().then(({ data }) => {
      if (data) {
        setRoom(data)
        setForm({
          title: data.title, description: data.description, rent_price: String(data.rent_price),
          location: data.location, city: data.city, room_type: data.room_type,
          num_beds: String(data.num_beds), is_available: data.is_available, amenities: data.amenities || [],
        })
      }
      setFetchLoading(false)
    })
  }, [params.id, supabase])

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('rooms').update({
      title: form.title, description: form.description, rent_price: Number(form.rent_price),
      location: form.location, city: form.city, room_type: form.room_type,
      num_beds: Number(form.num_beds), is_available: form.is_available, amenities: form.amenities,
    }).eq('id', params.id)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Room updated! ✓' })
      router.push('/owner')
    }
    setLoading(false)
  }

  if (fetchLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-3xl mx-auto px-4 py-8">
        <Link href="/owner" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-display font-bold mb-2">Edit Room</h1>
          <p className="text-muted-foreground mb-8">Update your listing details</p>

          <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-2xl p-6 border border-border/50">
            <div className="space-y-1.5">
              <Label>Room Title *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Area / Street *</Label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={v => setForm({...form, city: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Room Type *</Label>
                <Select value={form.room_type} onValueChange={v => setForm({...form, room_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>No. of Beds</Label>
                <Input type="number" min="1" value={form.num_beds} onChange={e => setForm({...form, num_beds: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Rent (₹)</Label>
                <Input type="number" value={form.rent_price} onChange={e => setForm({...form, rent_price: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <Switch checked={form.is_available} onCheckedChange={v => setForm({...form, is_available: v})} />
              <Label>Available for Rent</Label>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_LIST.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <Checkbox checked={form.amenities.includes(amenity)} onCheckedChange={() => toggleAmenity(amenity)} />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>

          {room && (
            <div className="mt-6 glass-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-display font-semibold text-lg mb-4">Room Photos</h3>
              <ImageUpload roomId={params.id as string} existingImages={room.room_images} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

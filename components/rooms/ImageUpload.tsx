'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Star } from 'lucide-react'
import Image from 'next/image'
import { createBrowserClient, SUPABASE_URL } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface ImageUploadProps {
  roomId: string
  existingImages?: any[]
  onUploadComplete?: () => void
}

export function ImageUpload({ roomId, existingImages = [], onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(existingImages)
  const supabase = createBrowserClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${roomId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, file)

      if (!uploadError) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/room-images/${fileName}`
        const { data } = await supabase.from('room_images').insert({
          room_id: roomId,
          url,
          is_primary: images.length === 0,
        }).select().single()
        if (data) setImages(prev => [...prev, data])
      }
    }
    setUploading(false)
    toast({ title: 'Images uploaded successfully!' })
    onUploadComplete?.()
  }, [roomId, images.length, supabase, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 10,
  })

  const deleteImage = async (imageId: string, url: string) => {
    await supabase.from('room_images').delete().eq('id', imageId)
    // extract path from url
    const path = url.split('/room-images/')[1]
    if (path) await supabase.storage.from('room-images').remove([path])
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const setPrimary = async (imageId: string) => {
    // unset all
    await supabase.from('room_images').update({ is_primary: false }).eq('room_id', roomId)
    // set this one
    await supabase.from('room_images').update({ is_primary: true }).eq('id', imageId)
    setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })))
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-border hover:border-orange-400 hover:bg-orange-500/5'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">{isDragActive ? 'Drop images here...' : 'Drag & drop images or click to upload'}</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP up to 10MB each</p>
        {uploading && <p className="text-orange-500 text-sm mt-2 animate-pulse">Uploading...</p>}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-muted">
              <Image src={img.url} alt="Room" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPrimary(img.id)}
                  className={`p-1.5 rounded-full ${img.is_primary ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-yellow-500'} transition-colors`}
                  title="Set as primary"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteImage(img.id, img.url)}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

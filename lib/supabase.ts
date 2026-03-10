import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const SUPABASE_URL = 'https://ndfqysbzwckegfrmrgan.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZnF5c2J6d2NrZWdmcm1yZ2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzU0NzIsImV4cCI6MjA4ODY1MTQ3Mn0.QpomigKhoa6drq381guK-gaJvry7fxnIqhA-Nuh1vGs'
export const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZnF5c2J6d2NrZWdmcm1yZ2FuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA3NTQ3MiwiZXhwIjoyMDg4NjUxNDcyfQ.MFZsOgtotyAqlqzuPvcuQfWYxq0DchhDQ5MMPb-CM-M'

// Browser client (for client components)
export const createBrowserClient = () =>
  createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  })

// Server client (for server components)
export const createServerClient = () =>
  createServerComponentClient(
    { cookies },
    { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY }
  )

// Admin client (bypasses RLS)
export const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'citizen' | 'owner' | 'admin'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'citizen' | 'owner' | 'admin'
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          role?: 'citizen' | 'owner' | 'admin'
          phone?: string | null
          avatar_url?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          rent_price: number
          location: string
          city: string
          room_type: string
          amenities: string[]
          num_beds: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          title: string
          description: string
          rent_price: number
          location: string
          city: string
          room_type: string
          amenities?: string[]
          num_beds?: number
          is_available?: boolean
        }
        Update: {
          title?: string
          description?: string
          rent_price?: number
          location?: string
          city?: string
          room_type?: string
          amenities?: string[]
          num_beds?: number
          is_available?: boolean
        }
      }
      room_images: {
        Row: {
          id: string
          room_id: string
          url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          room_id: string
          url: string
          is_primary?: boolean
        }
        Update: {
          is_primary?: boolean
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          room_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          room_id: string
        }
        Update: never
      }
    }
  }
}

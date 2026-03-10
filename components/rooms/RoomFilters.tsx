'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CITIES, ROOM_TYPES } from '@/lib/utils'

interface FiltersState {
  search: string
  city: string
  room_type: string
  min_price: string
  max_price: string
  is_available: string
}

interface RoomFiltersProps {
  onFiltersChange: (filters: Partial<FiltersState>) => void
}

export function RoomFilters({ onFiltersChange }: RoomFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    search: '', city: '', room_type: '', min_price: '', max_price: '', is_available: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const empty = { search: '', city: '', room_type: '', min_price: '', max_price: '', is_available: '' }
    setFilters(empty)
    onFiltersChange(empty)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="glass-card rounded-2xl p-4 border border-border/50">
      {/* Main search + city row */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms, locations..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filters.city} onValueChange={v => updateFilter('city', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : ''}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select value={filters.room_type} onValueChange={v => updateFilter('room_type', v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Price (₹)"
            value={filters.min_price}
            onChange={e => updateFilter('min_price', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price (₹)"
            value={filters.max_price}
            onChange={e => updateFilter('max_price', e.target.value)}
          />
          <Select value={filters.is_available} onValueChange={v => updateFilter('is_available', v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Available</SelectItem>
              <SelectItem value="false">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { CITIES, ROOM_TYPES } from '@/lib/utils'

export interface SearchFilters {
  query: string
  city: string
  roomType: string
  minPrice: string
  maxPrice: string
  availability: string
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

const defaultFilters: SearchFilters = {
  query: '', city: '', roomType: '', minPrice: '', maxPrice: '', availability: ''
}

export default function SearchBar({ onSearch, initialFilters = {} }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (key: keyof SearchFilters, value: string) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    onSearch(defaultFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by title or location..."
            value={filters.query}
            onChange={e => handleChange('query', e.target.value)}
            className="input-glass pl-10 pr-4 h-11 text-sm"
          />
        </div>
        <select
          value={filters.city}
          onChange={e => handleChange('city', e.target.value)}
          className="input-glass w-40 h-11 text-sm cursor-pointer"
        >
          <option value="">All Cities</option>
          {CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn-ghost h-11 px-3 flex items-center gap-2 text-sm ${showAdvanced ? 'border-sky-500/40 text-sky-300' : ''}`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
        </button>
        <button type="submit" className="btn-primary h-11 px-5 text-sm">
          Search
        </button>
        {hasActiveFilters && (
          <button type="button" onClick={handleClear} className="btn-ghost h-11 px-3 text-slate-400 hover:text-red-400">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <select
            value={filters.roomType}
            onChange={e => handleChange('roomType', e.target.value)}
            className="input-glass text-sm cursor-pointer"
          >
            <option value="">Any Type</option>
            {ROOM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filters.availability}
            onChange={e => handleChange('availability', e.target.value)}
            className="input-glass text-sm cursor-pointer"
          >
            <option value="">Any Status</option>
            <option value="true">Available</option>
            <option value="false">Occupied</option>
          </select>
          <input
            type="number"
            placeholder="Min Price (₹)"
            value={filters.minPrice}
            onChange={e => handleChange('minPrice', e.target.value)}
            className="input-glass text-sm"
          />
          <input
            type="number"
            placeholder="Max Price (₹)"
            value={filters.maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
            className="input-glass text-sm"
          />
        </motion.div>
      )}
    </form>
  )
}

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const ROOM_TYPES = [
  'Single Room',
  'Double Room',
  'Studio Apartment',
  '1 BHK',
  '2 BHK',
  '3 BHK',
  'PG',
  'Hostel',
  'Flat/Apartment',
]

export const AMENITIES_LIST = [
  'WiFi',
  'AC',
  'Heating',
  'Parking',
  'Gym',
  'Swimming Pool',
  'Laundry',
  'Kitchen',
  'Furnished',
  'Security',
  'CCTV',
  'Elevator',
  'Power Backup',
  'Water Supply 24/7',
  'Geyser',
  'TV',
  'Balcony',
  'Garden',
  'Pet Friendly',
  'Meals Included',
]

export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Bhopal',
  'Patna',
  'Vadodara',
  'Coimbatore',
  'Visakhapatnam',
  'Kochi',
]

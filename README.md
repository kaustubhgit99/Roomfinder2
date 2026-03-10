# 🏠 RoomFinder — Production-Ready Room Finding Platform

A modern, full-stack room finding web application built with Next.js 14, Supabase, TailwindCSS, and Framer Motion.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database (Supabase)
1. Open your Supabase project: https://ndfqysbzwckegfrmrgan.supabase.co
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `database.sql`
4. Click **Run**

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Citizen** | Browse rooms, search/filter, save favorites, view owner contact |
| **Owner** | List rooms, upload photos, edit/delete listings, toggle availability |
| **Admin** | View all users, delete users, moderate room listings |

### Create an Admin User
1. Sign up normally at `/auth/signup`
2. In Supabase SQL Editor, run:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📁 Project Structure

```
room-finder/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/page.tsx    # Login
│   │   └── signup/page.tsx   # Signup with role selection
│   ├── citizen/
│   │   ├── page.tsx          # Browse + filter rooms
│   │   └── favorites/page.tsx
│   ├── owner/
│   │   ├── page.tsx          # Owner dashboard
│   │   ├── add-room/page.tsx
│   │   └── edit-room/[id]/page.tsx
│   ├── admin/page.tsx        # Admin panel
│   └── room/[id]/page.tsx    # Room detail
├── components/
│   ├── layout/Navbar.tsx
│   ├── rooms/
│   │   ├── RoomCard.tsx
│   │   ├── RoomFilters.tsx
│   │   ├── RoomSkeleton.tsx
│   │   └── ImageUpload.tsx
│   ├── shared/ThemeProvider.tsx
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── supabase.ts           # Supabase clients + types
│   ├── hooks.ts              # useAuth, useRooms, useFavorites
│   └── utils.ts              # Helpers, constants
└── database.sql              # Full Supabase setup SQL
```

---

## ✨ Features

- **Authentication** — Supabase Auth with role selection (Citizen/Owner)
- **Room Listings** — Full CRUD with images, amenities, availability
- **Advanced Search** — Filter by city, type, price range, availability
- **Favorites** — Citizens can save/unsave rooms
- **Image Upload** — Drag & drop multi-image upload with primary photo
- **Owner Dashboard** — Manage all listings with stats
- **Admin Panel** — View/delete users and rooms
- **Dark Mode** — Full dark/light theme toggle
- **Responsive** — Works on all screen sizes
- **Glassmorphism UI** — Premium modern design

---

## 🎨 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **UI Components**: Radix UI primitives + custom Shadcn components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Fonts**: Playfair Display + DM Sans

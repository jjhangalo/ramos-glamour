# 🛍️ Ramos Glamour - E-Commerce Platform

A modern, high-performance e-commerce platform built with **Next.js** and **Supabase**. This monorepo-style project consists of two distinct applications: a public storefront (`store`) and a secure administrative dashboard (`admin`).

## 🏗️ Architecture

The project is divided into two separate Next.js applications to ensure strict separation of concerns, optimized bundles, and independent deployment cycles.

### 1. Storefront (`/store`)
The public-facing e-commerce application designed for optimal user experience and high conversion rates.
- **Dynamic Catalog**: Server-side rendered product listings with URL-based pagination and category filtering.
- **Promotions Engine**: Real-time price calculation displaying original and discounted prices.
- **Responsive Design**: Mobile-first architecture with off-canvas navigation (`Sheet`) and fluid typography.
- **Resilient Data Fetching**: Graceful error handling using Next.js `error.tsx` and `not-found.tsx` boundaries.

### 2. Admin Dashboard (`/admin`)
A secure, feature-rich control panel for store managers and administrators.
- **Role-Based Access Control (RBAC)**: Distinct permissions for standard admins and a protected `MASTER_ADMIN`.
- **Inventory Management**: CRUD operations for products, categories, and inventory tracking.
- **Promotions Management**: Set temporary price drops with start/end dates without mutating base product prices.
- **Declarative Forms**: Built with `react-hook-form` and `zod` for strict type-safe data validation and automated slug generation.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: React Hook Form + Zod
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.17+)
- pnpm (v9.x or v10.x)
- A Supabase project

### 1. Clone the repository
```bash
git clone [https://github.com/hangalito/ramos-glamour.git](https://github.com/hangalito/ramos-glamour.git)
cd ramos-glamour
```

### 2. Environment Setup
You will need to configure environment variables for both applications. Create a `.env.local` file in both `/store` and `/admin` directories.

**Admin (`admin/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MASTER_ADMIN_ID=your_master_admin_uuid
NEXT_PUBLIC_MASTER_ADMIN_ID=your_master_admin_uuid
```

**Store (`store/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
Run the following command in both the `/store` and `/admin` directories:
```bash
pnpm install
```

### 4. Run the Development Servers
You can run both applications simultaneously on different ports.

**For the Store:**
```bash
cd store
pnpm dev # Runs on http://localhost:3000
```

**For the Admin:**
```bash
cd admin
pnpm dev # Runs on http://localhost:3001
```

## 🗄️ Database Schema Highlights
The platform relies on a relational Supabase PostgreSQL database:
- `products`: Core product catalog (`is_active`, `is_featured`).
- `categories`: Hierarchical taxonomies with auto-generated slugs.
- `promotions`: Junction/overlay table applying temporary `promo_price` to specific `product_id`s.
- `profiles`: Extended user data mapping auth users to `role`s ('client' or 'admin').

## 🛡️ Security & Performance
- **Server Actions**: All database mutations occur securely on the server without exposing API routes.
- **Strict Typing**: End-to-end TypeScript coverage from database schemas (via Supabase CLI) to React components.
- **Optimized Assets**: Next.js `<Image />` component utilized with responsive `sizes` properties.

---
*Developed for Ramos Glamour.*

# JMD Online Book

JMD Online Book is a professional multi-tenant SaaS gaming wallet system designed for secure fund management, referral tracking, and administrative control.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Backend/Database**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Language**: TypeScript

## ✨ Key Features

- **Multi-tenancy**: Isolated environments for different tenants with scalable management.
- **Wallet System**: Robust gaming wallet with real-time balance updates and secure transactions.
- **Referral Commissions**: Automated referral tracking and commission distribution.
- **Role-Based Access Control (RBAC)**: Seamless redirection and permission management for Super-Admins, Admins, and Users.
- **Secure API Proxy**: Server-side proxying to hide backend endpoints and manage authentication tokens securely via HttpOnly cookies.

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 20+
- npm or pnpm
- A Supabase project

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jmd-online-book
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   BACKEND_URL=your_backend_api_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

The project follows a modern Next.js architecture utilizing the App Router for optimal performance and SEO. 

- **Client Side**: React components with Tailwind CSS 4 for a high-performance, responsive UI.
- **Edge Layer**: Middleware and Edge Functions (`auth-edge.ts`, `proxy.ts`) handle authentication and request routing at the edge to minimize latency.
- **Backend**: A Fastify-based backend (located in `sbe/backend`) handles heavy business logic, wallet transactions, and database interactions via Drizzle ORM.
- **Auth Flow**: Authentication is managed via Supabase Auth, with sessions persisted using secure HttpOnly cookies to prevent XSS attacks.

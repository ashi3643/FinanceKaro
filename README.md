# FinanceSekho - Financial Literacy Platform

A comprehensive financial education platform with AI-powered features, adaptive learning, and gamification. Built with Next.js, React, and Supabase.

## Features

- **Phase 1**: UI/UX Overhaul with SEBI/RBI disclaimers, segmented entry flow, parental consent
- **Phase 2**: Scam Radar with screenshot upload, AI detection, and SOS features
- **Phase 3**: Deep Learning adaptive learning with DKT model
- **Phase 4**: Gamification with Financial IQ score and streak milestones
- **Phase 5**: Data Integration with 30-day lag and DPDP Act compliance
- **Account Aggregator**: RBI-licensed framework integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for backend)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: For Vercel deployment, add these environment variables in your Vercel project settings:
- Go to Project Settings → Environment Variables
- Add each variable with the same names as above
- Redeploy after adding variables

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Troubleshooting Deployment Issues

If deployment fails:
1. Check that all environment variables are set in Vercel
2. Verify Supabase project is active
3. Check Vercel deployment logs for specific errors
4. Ensure Node.js version is 18+ in Vercel settings

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, TailwindCSS, Lucide icons
- **State**: Zustand
- **Backend**: Supabase
- **AI/ML**: Deep Knowledge Tracing (DKT) model
- **Internationalization**: next-intl
- **Deployment**: Vercel

## Compliance

- SEBI (30-day data lag for market data)
- RBI (Account Aggregator framework)
- DPDP Act (Data consent management)

## License

MIT

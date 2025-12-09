# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is currently configured.

## Architecture

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS 4.

**App Router Structure:**
- `app/layout.tsx` - Root layout with ClerkProvider and Geist font configuration
- `app/page.tsx` - Home page (server component by default)
- `app/globals.css` - Global styles with Tailwind and dark mode CSS variables
- `middleware.ts` - Clerk authentication middleware using `clerkMiddleware()`

**Key Patterns:**
- Uses Next.js App Router (not Pages Router)
- Server Components by default
- Path alias: `@/*` maps to project root
- Styling via Tailwind utility classes with `dark:` prefix for dark mode
- Font optimization with `next/font/google`
- Image optimization with `next/image`

**TypeScript:**
- Strict mode enabled
- Use `import type` for type-only imports

**Authentication (Clerk):**
- `ClerkProvider` wraps the app in `app/layout.tsx`
- `clerkMiddleware()` from `@clerk/nextjs/server` in `middleware.ts`
- Use `auth()` from `@clerk/nextjs/server` (async) for server-side auth
- Components: `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`
- Environment variables in `.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

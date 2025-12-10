# Authentication Coding Standards

## Overview

This application uses **Clerk** as the exclusive authentication provider.

## Setup

### Environment Variables

Required in `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Provider Configuration

`ClerkProvider` wraps the entire application in `app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

Authentication middleware is configured in `middleware.ts` using `clerkMiddleware()`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Server-Side Authentication

### Getting the Current User

Use `auth()` from `@clerk/nextjs/server` in Server Components:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // User is authenticated, proceed with data fetching
}
```

### Important Rules

1. **Always use `await auth()`** - The `auth()` function is async
2. **Check for `userId`** - Always verify the user is authenticated before accessing protected resources
3. **Redirect unauthenticated users** - Use `redirect()` to send users to sign-in when not authenticated

## Client-Side Components

### Available Components

Import from `@clerk/nextjs`:

| Component | Purpose |
|-----------|---------|
| `<SignInButton>` | Triggers sign-in flow |
| `<SignUpButton>` | Triggers sign-up flow |
| `<UserButton>` | User avatar with account menu |
| `<SignedIn>` | Renders children only when signed in |
| `<SignedOut>` | Renders children only when signed out |

### Usage Pattern

```typescript
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

### Modal vs Redirect Mode

- Use `mode="modal"` for inline authentication dialogs
- Omit `mode` prop for redirect-based authentication

## Data Access Security

**CRITICAL:** All data queries MUST be scoped to the authenticated user.

### Pattern

```typescript
// In Server Component
const { userId } = await auth();

if (!userId) {
  redirect("/sign-in");
}

// Pass userId to data functions
const data = await getUserData(userId);
```

### Rules

1. **Never trust client-provided user IDs** - Always get `userId` from `auth()`
2. **Filter all queries by userId** - See `/docs/data-fetching.md` for details
3. **Users can only access their own data** - No exceptions

## Summary

| Context | Method |
|---------|--------|
| Server Components | `auth()` from `@clerk/nextjs/server` |
| Client Components | `<SignedIn>`, `<SignedOut>`, etc. from `@clerk/nextjs` |
| Middleware | `clerkMiddleware()` from `@clerk/nextjs/server` |

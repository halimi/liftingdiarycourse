# Routing Coding Standards

## Overview

All application routes are organized under the `/dashboard` path. The `/dashboard` page and all its sub-pages are **protected routes** accessible only to authenticated users.

## Route Structure

```
app/
├── page.tsx                          # Public landing page
├── dashboard/
│   ├── page.tsx                      # Protected: Dashboard home
│   ├── workout/
│   │   ├── new/
│   │   │   └── page.tsx              # Protected: Create workout
│   │   └── [workoutId]/
│   │       └── page.tsx              # Protected: Edit workout
│   └── ...                           # All sub-routes are protected
```

## Route Protection

### Middleware Configuration

Route protection is handled exclusively via Next.js middleware using Clerk's `clerkMiddleware()` with `createRouteMatcher()`. This ensures authentication checks happen before any page code executes.

**Required middleware setup in `middleware.ts`:**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### How It Works

1. `createRouteMatcher(["/dashboard(.*)"])` - Matches `/dashboard` and all nested routes
2. `auth.protect()` - Redirects unauthenticated users to Clerk's sign-in page
3. Middleware runs before page rendering, preventing unauthorized access

### Important Rules

1. **All `/dashboard` routes are protected** - No exceptions
2. **Use middleware for route protection** - Do not rely on page-level auth checks for access control
3. **Public routes stay outside `/dashboard`** - Landing pages, marketing pages, etc.

## Creating New Routes

### Protected Routes (Under /dashboard)

When adding new routes under `/dashboard`:

```
app/dashboard/[feature]/page.tsx
```

These are automatically protected by the middleware - no additional configuration needed.

### Route Naming Conventions

| Pattern | Use Case | Example |
|---------|----------|---------|
| `[param]` | Dynamic segments | `/dashboard/workout/[workoutId]` |
| `new` | Creation pages | `/dashboard/workout/new` |
| Noun (plural) | List pages | `/dashboard/workouts` |
| Noun (singular) | Detail/edit pages | `/dashboard/workout/[id]` |

## Server-Side Auth in Protected Routes

Even though routes are protected by middleware, you still need `auth()` to get the `userId` for data access:

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  // userId is guaranteed to exist in protected routes
  // Use it for data fetching scoped to the user
  const data = await getUserData(userId!);

  return <div>{/* render data */}</div>;
}
```

**Note:** In middleware-protected routes, `userId` will always exist, but TypeScript doesn't know this. Use non-null assertion (`userId!`) or add a guard for type safety.

## Navigation

### Internal Navigation

Use Next.js `Link` component for client-side navigation:

```typescript
import Link from "next/link";

<Link href="/dashboard/workout/new">New Workout</Link>
```

### Programmatic Navigation

Use `redirect()` from `next/navigation` in Server Components:

```typescript
import { redirect } from "next/navigation";

// After form submission
redirect("/dashboard");
```

### Navigation After Actions

Server Actions should redirect to appropriate dashboard routes:

```typescript
"use server";

export async function createWorkout(formData: FormData) {
  // ... create workout logic
  redirect("/dashboard");
}
```

## Summary

| Concept | Implementation |
|---------|----------------|
| Protected routes | All routes under `/dashboard` |
| Protection mechanism | `clerkMiddleware()` with `createRouteMatcher()` |
| Public routes | Routes outside `/dashboard` directory |
| Getting user ID | `auth()` from `@clerk/nextjs/server` |
| Navigation | `Link` component or `redirect()` |

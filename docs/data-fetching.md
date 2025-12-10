# Data Fetching

## Critical Rules

**ALL data fetching in this application MUST be done via Server Components.**

This is non-negotiable. Do NOT fetch data via:
- Route handlers (`app/api/*`)
- Client components (`'use client'`)
- `useEffect` hooks
- Any other client-side data fetching method

## Database Queries

All database queries MUST:

1. **Use helper functions in the `/data` directory** - Never write database queries directly in components
2. **Use Drizzle ORM** - Do NOT use raw SQL queries
3. **Filter by authenticated user** - Every query MUST scope data to the currently logged-in user

### User Data Isolation

**CRITICAL:** A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data under any circumstances.

Every data helper function must:
- Accept the `userId` from Clerk authentication
- Include a `WHERE` clause filtering by `userId`
- Never expose data from other users

### Example Pattern

```typescript
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(userId: string, workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ALWAYS filter by userId
      )
    );
  return workout;
}
```

### Using in Server Components

```typescript
// app/workouts/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const workouts = await getWorkouts(userId);

  return <WorkoutsList workouts={workouts} />;
}
```

## Summary

| Allowed | NOT Allowed |
|---------|-------------|
| Server Components | Route handlers |
| Drizzle ORM | Raw SQL |
| `/data` helper functions | Direct DB queries in components |
| User-scoped queries | Queries without userId filter |

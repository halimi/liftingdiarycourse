# Server Components

## Overview

This is a Next.js 16 project. Server Components are the default in the App Router and have specific requirements that must be followed.

## Dynamic Route Parameters

**CRITICAL:** In Next.js 16, route parameters (`params`) are asynchronous and MUST be awaited.

### Rules

1. **`params` is a Promise** - Always await `params` before accessing its properties
2. **Type `params` correctly** - Use `Promise<{ paramName: string }>` for the type definition
3. **Await before destructuring** - Never destructure `params` directly from props

### Correct Pattern

```typescript
// app/dashboard/workout/[workoutId]/page.tsx

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { workoutId } = await params;

  // Now use workoutId
  const workout = await getWorkoutById(userId, workoutId);

  return <div>...</div>;
}
```

### Incorrect Pattern (DO NOT USE)

```typescript
// ❌ WRONG - params is not awaited
export default async function EditWorkoutPage({ params }: { params: { workoutId: string } }) {
  const workout = await getWorkoutById(userId, params.workoutId);
  return <div>...</div>;
}
```

### Multiple Parameters

For routes with multiple dynamic segments:

```typescript
// app/dashboard/workout/[workoutId]/exercise/[exerciseId]/page.tsx

type Params = Promise<{ workoutId: string; exerciseId: string }>;

export default async function ExercisePage({ params }: { params: Params }) {
  const { workoutId, exerciseId } = await params;

  // Use both parameters
  return <div>...</div>;
}
```

## Search Parameters

Search parameters (`searchParams`) are also asynchronous in Next.js 16:

```typescript
type SearchParams = Promise<{ date?: string; filter?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { date, filter } = await searchParams;

  return <div>...</div>;
}
```

## Summary

| Prop | Type | Requirement |
|------|------|-------------|
| `params` | `Promise<{ ... }>` | MUST be awaited |
| `searchParams` | `Promise<{ ... }>` | MUST be awaited |

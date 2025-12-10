# Data Mutations

This document outlines the coding standards for all data mutations in this application.

## Overview

Data mutations follow a strict pattern:

1. **Server Actions** handle form submissions and mutations from the UI
2. **Data Helper Functions** wrap all database calls via Drizzle ORM
3. **Zod Validation** ensures type safety and input validation

## Directory Structure

```
src/
├── actions/
│   └── [feature]/
│       └── actions.ts      # Server actions colocated with features
├── data/
│   └── [entity].ts         # Database helper functions
└── app/
    └── [route]/
        └── actions.ts      # Route-colocated server actions
```

## Data Helper Functions

All database operations MUST be performed through helper functions in the `src/data` directory. These functions wrap Drizzle ORM calls and provide a clean abstraction layer.

### Rules

- One file per entity/table (e.g., `src/data/workouts.ts`, `src/data/exercises.ts`)
- Functions should be async and return typed results
- Use Drizzle ORM for all database operations
- Handle database errors appropriately

### Example

```typescript
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(data: {
  userId: string;
  name: string;
  date: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}

export async function getWorkoutById(id: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id));

  return workout;
}

export async function updateWorkout(
  id: string,
  data: Partial<{ name: string; date: Date }>
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(eq(workouts.id, id))
    .returning();

  return workout;
}

export async function deleteWorkout(id: string) {
  await db.delete(workouts).where(eq(workouts.id, id));
}
```

## Server Actions

All data mutations from the UI MUST go through Server Actions. Server actions are colocated in `actions.ts` files.

### Rules

1. **File Naming**: Always name the file `actions.ts`
2. **Colocation**: Place `actions.ts` next to the components that use them
3. **"use server" Directive**: Must be at the top of the file
4. **Typed Parameters**: All parameters MUST be typed - **NEVER use `FormData`**
5. **Zod Validation**: ALL arguments MUST be validated with Zod schemas
6. **Authentication**: Verify user authentication before mutations
7. **Call Data Helpers**: Use functions from `src/data` for database operations
8. **No Redirects in Server Actions**: NEVER use `redirect()` from `next/navigation` within server actions. Redirects MUST be performed client-side after the server action resolves

### Example

```typescript
// app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout, deleteWorkout } from "@/data/workouts";

// Define Zod schemas for validation
const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  date: z.coerce.date(),
});

const deleteWorkoutSchema = z.object({
  id: z.string().uuid("Invalid workout ID"),
});

// Types derived from schemas
type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input with Zod
  const validated = createWorkoutSchema.parse(input);

  // 3. Call data helper function
  const workout = await createWorkout({
    userId,
    name: validated.name,
    date: validated.date,
  });

  // 4. Revalidate cache
  revalidatePath("/workouts");

  return workout;
}

export async function deleteWorkoutAction(input: DeleteWorkoutInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input with Zod
  const validated = deleteWorkoutSchema.parse(input);

  // 3. Call data helper function
  await deleteWorkout(validated.id);

  // 4. Revalidate cache
  revalidatePath("/workouts");
}
```

## Calling Server Actions from Components

### Client Components

```typescript
"use client";

import { createWorkoutAction } from "./actions";

export function CreateWorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Extract typed data from form
    const formData = new FormData(e.currentTarget);

    await createWorkoutAction({
      name: formData.get("name") as string,
      date: new Date(formData.get("date") as string),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="date" type="date" required />
      <button type="submit">Create Workout</button>
    </form>
  );
}
```

### With React Hook Form and Zod

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorkoutAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWorkoutForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    await createWorkoutAction(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## Error Handling

Server actions should return structured responses for error handling:

```typescript
"use server";

import { z } from "zod";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createWorkoutAction(
  input: CreateWorkoutInput
): Promise<ActionResult<Workout>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createWorkoutSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const workout = await createWorkout({
      userId,
      ...validated.data,
    });

    revalidatePath("/workouts");
    return { success: true, data: workout };
  } catch (error) {
    return { success: false, error: "Failed to create workout" };
  }
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Database calls | MUST use helper functions in `src/data` |
| ORM | MUST use Drizzle ORM |
| Mutations from UI | MUST use Server Actions |
| Server action files | MUST be named `actions.ts` |
| Server action params | MUST be typed, NEVER `FormData` |
| Input validation | MUST use Zod schemas |
| Authentication | MUST verify before mutations |
| Cache | MUST revalidate after mutations |
| Redirects | MUST be client-side, NEVER in server actions |

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

async function verifyWorkoutExerciseOwnership(
  userId: string,
  workoutExerciseId: string
) {
  const [result] = await db
    .select({ userId: schema.workouts.userId })
    .from(schema.workoutExercises)
    .innerJoin(
      schema.workouts,
      eq(schema.workoutExercises.workoutId, schema.workouts.id)
    )
    .where(eq(schema.workoutExercises.id, workoutExerciseId));

  if (!result || result.userId !== userId) {
    throw new Error("Workout exercise not found or unauthorized");
  }
}

async function verifySetOwnership(userId: string, setId: string) {
  const [result] = await db
    .select({ userId: schema.workouts.userId })
    .from(schema.sets)
    .innerJoin(
      schema.workoutExercises,
      eq(schema.sets.workoutExerciseId, schema.workoutExercises.id)
    )
    .innerJoin(
      schema.workouts,
      eq(schema.workoutExercises.workoutId, schema.workouts.id)
    )
    .where(eq(schema.sets.id, setId));

  if (!result || result.userId !== userId) {
    throw new Error("Set not found or unauthorized");
  }
}

export async function createSet(
  userId: string,
  workoutExerciseId: string,
  data: {
    reps: number | null;
    weight: string | null;
  }
) {
  // Verify ownership
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);

  // Get the max setNumber for this workout_exercise
  const [maxSetNumberResult] = await db
    .select({ maxSetNumber: max(schema.sets.setNumber) })
    .from(schema.sets)
    .where(eq(schema.sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (maxSetNumberResult?.maxSetNumber ?? 0) + 1;

  // Create set
  const [set] = await db
    .insert(schema.sets)
    .values({
      workoutExerciseId,
      setNumber: nextSetNumber,
      reps: data.reps,
      weight: data.weight,
    })
    .returning();

  return set;
}

export async function createSets(
  userId: string,
  workoutExerciseId: string,
  count: number
) {
  // Verify ownership
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);

  // Get the max setNumber for this workout_exercise
  const [maxSetNumberResult] = await db
    .select({ maxSetNumber: max(schema.sets.setNumber) })
    .from(schema.sets)
    .where(eq(schema.sets.workoutExerciseId, workoutExerciseId));

  const startSetNumber = (maxSetNumberResult?.maxSetNumber ?? 0) + 1;

  // Create multiple sets sequentially
  const createdSets = [];

  for (let i = 0; i < count; i++) {
    const [set] = await db
      .insert(schema.sets)
      .values({
        workoutExerciseId,
        setNumber: startSetNumber + i,
        reps: null,
        weight: null,
      })
      .returning();

    createdSets.push(set);
  }

  return createdSets;
}

export async function updateSet(
  userId: string,
  setId: string,
  data: {
    reps?: number | null;
    weight?: string | null;
    completed?: boolean;
  }
) {
  // Verify ownership
  await verifySetOwnership(userId, setId);

  // Update set
  const [set] = await db
    .update(schema.sets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.sets.id, setId))
    .returning();

  return set;
}

export async function deleteSet(userId: string, setId: string) {
  // Verify ownership
  await verifySetOwnership(userId, setId);

  // Delete set
  await db.delete(schema.sets).where(eq(schema.sets.id, setId));
}

export async function toggleSetCompletion(userId: string, setId: string) {
  // Verify ownership
  await verifySetOwnership(userId, setId);

  // Get current completion status
  const [currentSet] = await db
    .select()
    .from(schema.sets)
    .where(eq(schema.sets.id, setId));

  if (!currentSet) {
    throw new Error("Set not found");
  }

  // Toggle completion
  const [set] = await db
    .update(schema.sets)
    .set({ completed: !currentSet.completed, updatedAt: new Date() })
    .where(eq(schema.sets.id, setId))
    .returning();

  return set;
}

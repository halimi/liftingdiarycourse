import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  // Verify workout belongs to user
  const [workout] = await db
    .select()
    .from(schema.workouts)
    .where(
      and(eq(schema.workouts.id, workoutId), eq(schema.workouts.userId, userId))
    );

  if (!workout) {
    throw new Error("Workout not found or unauthorized");
  }

  // Get the max order value for this workout
  const [maxOrderResult] = await db
    .select({ maxOrder: max(schema.workoutExercises.order) })
    .from(schema.workoutExercises)
    .where(eq(schema.workoutExercises.workoutId, workoutId));

  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  // Create workout_exercise record
  const [workoutExercise] = await db
    .insert(schema.workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
    })
    .returning();

  return workoutExercise;
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: string
) {
  // Verify workout belongs to user through workout_exercise -> workout relation
  const [workoutExercise] = await db
    .select({
      workoutExerciseId: schema.workoutExercises.id,
      workoutId: schema.workoutExercises.workoutId,
      userId: schema.workouts.userId,
    })
    .from(schema.workoutExercises)
    .innerJoin(
      schema.workouts,
      eq(schema.workoutExercises.workoutId, schema.workouts.id)
    )
    .where(eq(schema.workoutExercises.id, workoutExerciseId));

  if (!workoutExercise || workoutExercise.userId !== userId) {
    throw new Error("Workout exercise not found or unauthorized");
  }

  // Delete workout_exercise (cascade deletes sets)
  await db
    .delete(schema.workoutExercises)
    .where(eq(schema.workoutExercises.id, workoutExerciseId));
}

export async function reorderWorkoutExercises(
  userId: string,
  workoutId: string,
  exerciseOrders: { workoutExerciseId: string; order: number }[]
) {
  // Verify workout belongs to user
  const [workout] = await db
    .select()
    .from(schema.workouts)
    .where(
      and(eq(schema.workouts.id, workoutId), eq(schema.workouts.userId, userId))
    );

  if (!workout) {
    throw new Error("Workout not found or unauthorized");
  }

  // Update all exercise orders sequentially
  for (const { workoutExerciseId, order } of exerciseOrders) {
    await db
      .update(schema.workoutExercises)
      .set({ order, updatedAt: new Date() })
      .where(
        and(
          eq(schema.workoutExercises.id, workoutExerciseId),
          eq(schema.workoutExercises.workoutId, workoutId)
        )
      );
  }
}

export async function getWorkoutExerciseById(
  userId: string,
  workoutExerciseId: string
) {
  // Get workout exercise with relations, verifying user ownership
  const result = await db.query.workoutExercises.findFirst({
    where: eq(schema.workoutExercises.id, workoutExerciseId),
    with: {
      workout: true,
      exercise: true,
      sets: {
        orderBy: (sets, { asc }) => [asc(sets.setNumber)],
      },
    },
  });

  if (!result || result.workout.userId !== userId) {
    return undefined;
  }

  return result;
}

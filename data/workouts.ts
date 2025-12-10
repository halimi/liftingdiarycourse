import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsByDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db.query.workouts.findMany({
    where: and(
      eq(schema.workouts.userId, userId),
      gte(schema.workouts.startedAt, startOfDay),
      lt(schema.workouts.startedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
    orderBy: (workouts, { desc }) => [desc(workouts.startedAt)],
  });
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsByDate>
>[number];

export async function createWorkout(data: {
  userId: string;
  name?: string;
  startedAt: Date;
}) {
  const [workout] = await db
    .insert(schema.workouts)
    .values(data)
    .returning();

  return workout;
}

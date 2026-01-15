import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getExercises() {
  return db.select().from(exercises);
}

export async function getExerciseById(exerciseId: string) {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId));

  return exercise;
}

export async function getExerciseByName(name: string) {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(sql`LOWER(${exercises.name}) = LOWER(${name})`);

  return exercise;
}

export async function createExercise(data: { name: string }) {
  // Find or create pattern: check if exercise exists first
  const existing = await getExerciseByName(data.name);

  if (existing) {
    return existing;
  }

  // Create new exercise if it doesn't exist
  const [exercise] = await db
    .insert(exercises)
    .values(data)
    .returning();

  return exercise;
}

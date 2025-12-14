"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().optional(),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createWorkoutAction(
  input: CreateWorkoutInput
): Promise<ActionResult<{ id: string; date: string }>> {
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
      name: validated.data.name || undefined,
      startedAt: validated.data.startedAt,
    });

    const dateParam = format(validated.data.startedAt, "yyyy-MM-dd");
    revalidatePath("/dashboard");

    return { success: true, data: { id: workout.id, date: dateParam } };
  } catch (error) {
    return { success: false, error: "Failed to create workout" };
  }
}

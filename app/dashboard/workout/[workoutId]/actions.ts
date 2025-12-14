"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
  name: z.string().optional(),
  startedAt: z.coerce.date(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateWorkoutAction(
  input: UpdateWorkoutInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateWorkoutSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const workout = await updateWorkout(userId, validated.data.workoutId, {
      name: validated.data.name,
      startedAt: validated.data.startedAt,
    });

    if (!workout) {
      return { success: false, error: "Workout not found" };
    }

    revalidatePath("/dashboard");

    return { success: true, data: { id: workout.id } };
  } catch (error) {
    return { success: false, error: "Failed to update workout" };
  }
}

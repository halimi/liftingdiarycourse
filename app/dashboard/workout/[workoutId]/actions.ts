"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";
import { createExercise } from "@/data/exercises";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  reorderWorkoutExercises,
} from "@/data/workout-exercises";
import {
  createSet,
  createSets,
  updateSet,
  deleteSet,
  toggleSetCompletion,
} from "@/data/sets";

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

// ============================================================================
// Exercise and Set Management Actions
// ============================================================================

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseName: z.string().min(1).max(255).trim(),
});

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
});

const reorderExercisesSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseOrders: z.array(
    z.object({
      workoutExerciseId: z.string().uuid(),
      order: z.number().int().min(0),
    })
  ),
});

const createSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  reps: z.number().int().min(0).nullable(),
  weight: z.string().regex(/^\d+\.?\d*$/).nullable(),
});

const createMultipleSetsSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  count: z.number().int().min(1).max(20),
});

const updateSetSchema = z.object({
  setId: z.string().uuid(),
  reps: z.number().int().min(0).nullable().optional(),
  weight: z.string().regex(/^\d+\.?\d*$/).nullable().optional(),
  completed: z.boolean().optional(),
});

const deleteSetSchema = z.object({
  setId: z.string().uuid(),
});

const toggleSetCompletionSchema = z.object({
  setId: z.string().uuid(),
});

export async function addExerciseToWorkoutAction(
  input: z.infer<typeof addExerciseSchema>
): Promise<ActionResult<{ workoutExerciseId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = addExerciseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const exercise = await createExercise({
      name: validated.data.exerciseName,
    });

    const workoutExercise = await addExerciseToWorkout(
      userId,
      validated.data.workoutId,
      exercise.id
    );

    revalidatePath(`/dashboard/workout/${validated.data.workoutId}`);

    return { success: true, data: { workoutExerciseId: workoutExercise.id } };
  } catch (error) {
    console.error("Error adding exercise to workout:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add exercise",
    };
  }
}

export async function removeExerciseFromWorkoutAction(
  input: z.infer<typeof removeExerciseSchema>
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = removeExerciseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    await removeExerciseFromWorkout(userId, validated.data.workoutExerciseId);

    revalidatePath("/dashboard/workout");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing exercise from workout:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove exercise",
    };
  }
}

export async function reorderExercisesAction(
  input: z.infer<typeof reorderExercisesSchema>
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = reorderExercisesSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    await reorderWorkoutExercises(
      userId,
      validated.data.workoutId,
      validated.data.exerciseOrders
    );

    revalidatePath("/dashboard/workout");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering exercises:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder exercises",
    };
  }
}

export async function createSetAction(
  input: z.infer<typeof createSetSchema>
): Promise<ActionResult<{ setId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createSetSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const set = await createSet(userId, validated.data.workoutExerciseId, {
      reps: validated.data.reps,
      weight: validated.data.weight,
    });

    revalidatePath("/dashboard/workout");

    return { success: true, data: { setId: set.id } };
  } catch (error) {
    console.error("Error creating set:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create set",
    };
  }
}

export async function createMultipleSetsAction(
  input: z.infer<typeof createMultipleSetsSchema>
): Promise<ActionResult<{ setIds: string[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createMultipleSetsSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const sets = await createSets(
      userId,
      validated.data.workoutExerciseId,
      validated.data.count
    );

    revalidatePath("/dashboard/workout");

    return {
      success: true,
      data: { setIds: sets.map((set) => set.id) },
    };
  } catch (error) {
    console.error("Error creating multiple sets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sets",
    };
  }
}

export async function updateSetAction(
  input: z.infer<typeof updateSetSchema>
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateSetSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    await updateSet(userId, validated.data.setId, {
      reps: validated.data.reps,
      weight: validated.data.weight,
      completed: validated.data.completed,
    });

    revalidatePath("/dashboard/workout");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating set:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update set",
    };
  }
}

export async function deleteSetAction(
  input: z.infer<typeof deleteSetSchema>
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = deleteSetSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    await deleteSet(userId, validated.data.setId);

    revalidatePath("/dashboard/workout");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting set:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete set",
    };
  }
}

export async function toggleSetCompletionAction(
  input: z.infer<typeof toggleSetCompletionSchema>
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = toggleSetCompletionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const set = await toggleSetCompletion(userId, validated.data.setId);

    revalidatePath("/dashboard/workout");

    return { success: true, data: { completed: set.completed } };
  } catch (error) {
    console.error("Error toggling set completion:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle set completion",
    };
  }
}

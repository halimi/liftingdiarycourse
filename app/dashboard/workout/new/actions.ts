"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().optional(),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = createWorkoutSchema.parse(input);

  await createWorkout({
    userId,
    name: validated.name || undefined,
    startedAt: validated.startedAt,
  });

  const dateParam = format(validated.startedAt, "yyyy-MM-dd");
  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${dateParam}`);
}

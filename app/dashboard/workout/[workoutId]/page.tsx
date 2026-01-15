import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithExercises } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";
import { ExerciseLogger } from "./exercise-logger";

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId } = await params;
  const workout = await getWorkoutWithExercises(userId, workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />

      <div className="mt-12">
        <ExerciseLogger workout={workout} />
      </div>
    </div>
  );
}

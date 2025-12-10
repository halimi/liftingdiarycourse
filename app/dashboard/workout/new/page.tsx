import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">New Workout</h1>
      <NewWorkoutForm />
    </div>
  );
}

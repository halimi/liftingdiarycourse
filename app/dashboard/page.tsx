import { redirect } from "next/navigation";
import { format, parse, isValid } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getWorkoutsByDate } from "@/data/workouts";
import { DatePicker } from "./date-picker";
import { WorkoutsList } from "./workouts-list";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  let date = new Date();

  if (params.date) {
    const parsed = parse(params.date, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      date = parsed;
    }
  }

  const workouts = await getWorkoutsByDate(userId, date);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="mb-8 flex items-center justify-between">
        <DatePicker date={date} />
        <Link href="/dashboard/workout/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log New Workout
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        <WorkoutsList workouts={workouts} />
      </div>
    </div>
  );
}

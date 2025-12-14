import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkoutWithExercises } from "@/data/workouts";

interface WorkoutsListProps {
  workouts: WorkoutWithExercises[];
}

export function WorkoutsList({ workouts }: WorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No workouts logged for this date.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {workouts.map((workout) => (
        <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle>{workout.name ?? "Workout"}</CardTitle>
              <CardDescription>
                {workout.workoutExercises.length} exercise
                {workout.workoutExercises.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            {workout.workoutExercises.length > 0 && (
              <CardContent>
                <ul className="space-y-2">
                  {workout.workoutExercises.map((we) => {
                    const completedSets = we.sets.filter((s) => s.completed);
                    return (
                      <li key={we.id} className="text-sm">
                        <span className="font-medium">{we.exercise.name}</span>
                        {completedSets.length > 0 && (
                          <span className="text-muted-foreground ml-2">
                            {completedSets.length} set
                            {completedSets.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}

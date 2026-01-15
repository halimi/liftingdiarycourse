"use client";

import { useState } from "react";
import type { getWorkoutWithExercises } from "@/data/workouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddExerciseDialog } from "./add-exercise-dialog";
import { ExerciseCard } from "./exercise-card";

type Workout = Awaited<ReturnType<typeof getWorkoutWithExercises>>;

interface ExerciseLoggerProps {
  workout: NonNullable<Workout>;
}

export function ExerciseLogger({ workout }: ExerciseLoggerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Exercises</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Exercise</Button>
      </div>

      {workout.workoutExercises.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No exercises added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workout.workoutExercises.map((workoutExercise) => (
            <ExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              workoutId={workout.id}
              allExercises={workout.workoutExercises}
            />
          ))}
        </div>
      )}

      <AddExerciseDialog
        workoutId={workout.id}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

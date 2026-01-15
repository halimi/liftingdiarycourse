"use client";

import { useState } from "react";
import type { getWorkoutWithExercises } from "@/data/workouts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { AddSetDialog } from "./add-set-dialog";
import { QuickAddSetsDialog } from "./quick-add-sets-dialog";
import {
  removeExerciseFromWorkoutAction,
  reorderExercisesAction,
} from "./actions";

type WorkoutExercise = NonNullable<
  Awaited<ReturnType<typeof getWorkoutWithExercises>>
>["workoutExercises"][number];

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  workoutId: string;
  allExercises: WorkoutExercise[];
}

export function ExerciseCard({
  workoutExercise,
  workoutId,
  allExercises,
}: ExerciseCardProps) {
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const currentIndex = allExercises.findIndex((e) => e.id === workoutExercise.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === allExercises.length - 1;

  async function handleMoveUp() {
    if (isFirst || isReordering) return;

    setIsReordering(true);

    // Create new array with swapped positions
    const reorderedExercises = [...allExercises];
    [reorderedExercises[currentIndex], reorderedExercises[currentIndex - 1]] =
      [reorderedExercises[currentIndex - 1], reorderedExercises[currentIndex]];

    // Assign sequential order values starting from 0
    const exerciseOrders = reorderedExercises.map((e, idx) => ({
      workoutExerciseId: e.id,
      order: idx,
    }));

    const result = await reorderExercisesAction({ workoutId, exerciseOrders });

    if (!result.success) {
      alert(result.error);
    }

    setIsReordering(false);
  }

  async function handleMoveDown() {
    if (isLast || isReordering) return;

    setIsReordering(true);

    // Create new array with swapped positions
    const reorderedExercises = [...allExercises];
    [reorderedExercises[currentIndex], reorderedExercises[currentIndex + 1]] =
      [reorderedExercises[currentIndex + 1], reorderedExercises[currentIndex]];

    // Assign sequential order values starting from 0
    const exerciseOrders = reorderedExercises.map((e, idx) => ({
      workoutExerciseId: e.id,
      order: idx,
    }));

    const result = await reorderExercisesAction({ workoutId, exerciseOrders });

    if (!result.success) {
      alert(result.error);
    }

    setIsReordering(false);
  }

  async function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to delete ${workoutExercise.exercise.name}? This will also delete all sets for this exercise.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await removeExerciseFromWorkoutAction({
      workoutExerciseId: workoutExercise.id,
    });

    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{workoutExercise.exercise.name}</CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveUp}
              disabled={isFirst || isReordering}
            >
              {isReordering ? "Moving..." : "Move Up"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveDown}
              disabled={isLast || isReordering}
            >
              {isReordering ? "Moving..." : "Move Down"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {workoutExercise.sets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sets logged yet.</p>
        ) : (
          <div className="space-y-2">
            {workoutExercise.sets.map((set) => (
              <SetRow key={set.id} set={set} />
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => setIsAddSetDialogOpen(true)}>Add Set</Button>
          <QuickAddSetsDialog workoutExerciseId={workoutExercise.id} />
        </div>
      </CardContent>

      <AddSetDialog
        workoutExerciseId={workoutExercise.id}
        open={isAddSetDialogOpen}
        onOpenChange={setIsAddSetDialogOpen}
      />
    </Card>
  );
}

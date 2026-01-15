"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMultipleSetsAction } from "./actions";

interface QuickAddSetsDialogProps {
  workoutExerciseId: string;
}

export function QuickAddSetsDialog({
  workoutExerciseId,
}: QuickAddSetsDialogProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState("3");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleQuickAdd() {
    setError(null);
    setIsLoading(true);

    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum < 1 || countNum > 20) {
      setError("Please enter a number between 1 and 20");
      setIsLoading(false);
      return;
    }

    const result = await createMultipleSetsAction({
      workoutExerciseId,
      count: countNum,
    });

    setIsLoading(false);

    if (result.success) {
      setOpen(false);
      setCount("3");
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Quick Add Sets</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Sets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <Label>Number of sets</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleQuickAdd} disabled={isLoading}>
              {isLoading ? "Adding..." : `Add ${count} Sets`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

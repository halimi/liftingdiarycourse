"use client";

import { useState } from "react";
import type { sets } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  toggleSetCompletionAction,
  updateSetAction,
  deleteSetAction,
} from "./actions";

type Set = typeof sets.$inferSelect;

interface SetRowProps {
  set: Set;
}

export function SetRow({ set }: SetRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [reps, setReps] = useState(set.reps?.toString() || "");
  const [weight, setWeight] = useState(set.weight || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggleComplete() {
    await toggleSetCompletionAction({ setId: set.id });
  }

  async function handleSave() {
    setIsSaving(true);

    await updateSetAction({
      setId: set.id,
      reps: reps ? parseInt(reps) : null,
      weight: weight || null,
    });

    setIsSaving(false);
    setIsEditing(false);
  }

  async function handleCancel() {
    setReps(set.reps?.toString() || "");
    setWeight(set.weight || "");
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this set?")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteSetAction({ setId: set.id });

    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded border">
      <Checkbox
        checked={set.completed}
        onCheckedChange={handleToggleComplete}
      />

      <span className="text-sm font-medium w-12">Set {set.setNumber}</span>

      {isEditing ? (
        <>
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Reps"
            className="w-20"
          />

          <Input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight"
            className="w-24"
          />

          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm flex-1">
            {set.reps || "-"} reps @ {set.weight || "-"} kg
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </>
      )}
    </div>
  );
}

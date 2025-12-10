"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWorkoutAction } from "./actions";

const formSchema = z.object({
  name: z.string().optional(),
  startedAt: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function NewWorkoutForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startedAt: format(new Date(), "yyyy-MM-dd"),
    },
  });

  async function onSubmit(values: FormValues) {
    await createWorkoutAction({
      name: values.name || undefined,
      startedAt: new Date(values.startedAt),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Leg Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Workout"}
        </Button>
      </form>
    </Form>
  );
}

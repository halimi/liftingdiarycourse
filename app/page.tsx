import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Lifting Diary
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400">
            Track your strength training progress with ease. Log your workouts, monitor your lifts,
            and watch yourself get stronger over time.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-3xl">📊</div>
              <h3 className="font-semibold text-black dark:text-zinc-50">Track Progress</h3>
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Log exercises, sets, and reps for every workout
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-3xl">💪</div>
              <h3 className="font-semibold text-black dark:text-zinc-50">Build Strength</h3>
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Monitor your lifts and watch your numbers grow
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-3xl">📈</div>
              <h3 className="font-semibold text-black dark:text-zinc-50">Stay Consistent</h3>
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Keep a complete history of your training journey
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <SignUpButton mode="modal">
              <button className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Get Started
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-base font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </main>
    </div>
  );
}

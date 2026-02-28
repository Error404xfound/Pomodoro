import PomodoroTimer from "@/components/PomodoroTimer";

/**
 * Home page for the Pomodoro application.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-4 text-center text-3xl font-bold text-zinc-900">
        Pomodoro Timer
      </h1>
      <PomodoroTimer />
    </main>
  );
}

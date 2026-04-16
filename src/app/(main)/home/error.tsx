"use client";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#080b12] text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-black text-red-500">
        Component Rendering Error
      </h1>
      <p className="text-gray-400 max-w-md">
        An error occurred while compiling the dashboard UI in production.
      </p>
      <div className="text-xs text-left text-gray-400 bg-black p-4 rounded-xl border border-red-900/50 max-w-2xl overflow-auto space-y-2">
        <p><strong>Message:</strong> {error.message}</p>
        <p><strong>Digest:</strong> {error.digest}</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-900 hover:from-amber-400 transition-all font-sans"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

import ProtectedRoute from "../components/ProtectedRoute";

export default function ItemsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-12 px-4">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-8 shadow-xl">
          <div className="flex gap-3 text-3xl font-semibold uppercase tracking-[0.35em]">
          </div>
          <p className="mt-6 text-sm text-neutral-400">
            Item inventory and history will appear here once records are available. This placeholder keeps navigation routes
            connected until the data pipeline is ready.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

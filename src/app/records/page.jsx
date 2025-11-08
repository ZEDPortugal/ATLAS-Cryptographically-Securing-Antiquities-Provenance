import ProtectedRoute from "../components/ProtectedRoute";

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-neutral-900/70 p-8 shadow-xl">
          <div className="flex gap-3 text-3xl font-semibold uppercase tracking-[0.35em]">
            <h1 className="text-emerald-400">Records</h1>
            <span className="text-neutral-200">Ledger</span>
          </div>
          <p className="mt-6 text-sm text-neutral-400">
            Ledger reporting and provenance timelines will be surfaced on this page. Hook up blockchain data to replace this
            placeholder content.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

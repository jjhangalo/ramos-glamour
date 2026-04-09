export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-8 w-64 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-200" />
      </div>

      {/* Filters Skeleton */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex gap-4">
            <div className="h-4 w-12 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>
        <div className="divide-y divide-slate-100 px-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-4 w-1/3 rounded bg-slate-100" />
                <div className="h-3 w-1/4 rounded bg-slate-100" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

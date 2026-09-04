export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          FLOWAI Store
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          This section is being built in an upcoming phase.
        </p>
      </div>
    </main>
  );
}
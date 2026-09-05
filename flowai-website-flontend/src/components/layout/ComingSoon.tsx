export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="store-container py-16">
      <div className="store-card mx-auto max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">FLOWAI Store</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">This section is being finished.</p>
      </div>
    </main>
  );
}

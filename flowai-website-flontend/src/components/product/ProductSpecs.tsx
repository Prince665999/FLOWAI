export default function ProductSpecs({ specifications }: { specifications: Record<string, unknown> }) {
  const entries = Object.entries(specifications ?? {});
  return (
    <section className="store-card p-5">
      <h2 className="font-semibold text-slate-900">Specifications</h2>
      {entries.length ? (
        <dl className="mt-3 divide-y divide-slate-100">
          {entries.map(([key, value]) => (
            <div className="flex justify-between gap-4 py-3 text-sm" key={key}>
              <dt className="capitalize text-slate-500">{key.replace(/_/g, " ")}</dt>
              <dd className="font-medium text-slate-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No specifications listed.</p>
      )}
    </section>
  );
}

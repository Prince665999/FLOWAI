export default function CitationChip({ label }: { label: string }) {
  return (
    <span className="mr-1 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
      {label}
    </span>
  );
}

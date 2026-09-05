export default function ProductGallery({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-slate-100 to-brand-50 text-5xl font-bold text-brand-700">
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

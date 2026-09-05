import type { Address } from "@/types/address";

export default function ShippingStep({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: Address[];
  selectedId?: number;
  onSelect: (id: number) => void;
}) {
  if (!addresses.length) {
    return <p className="text-sm text-slate-500">Add a shipping address to continue.</p>;
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <label
          key={address.id}
          className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
            selectedId === address.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="shipping-address"
            checked={selectedId === address.id}
            onChange={() => onSelect(address.id)}
          />
          <span>
            <span className="block font-medium">{address.full_name}</span>
            <span className="text-sm text-slate-500">
              {address.line1}, {address.city} {address.postal_code} {address.country}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

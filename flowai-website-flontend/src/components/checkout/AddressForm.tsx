"use client";

import { useState } from "react";

import { addressSchema, type AddressInput } from "@/lib/validators/address";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

const EMPTY: AddressInput = {
  full_name: "",
  line1: "",
  city: "",
  country: "US",
  label: "",
  phone: "",
  line2: "",
  state: "",
  postal_code: "",
};

export default function AddressForm({
  initial,
  onSubmit,
  submitting = false,
}: {
  initial?: Partial<AddressInput>;
  onSubmit: (values: AddressInput) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<AddressInput>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    const parsed = addressSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="store-label">Full name</span>
        <Input value={values.full_name} onChange={(e) => setField("full_name", e.target.value)} />
        {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name}</p> : null}
      </label>
      <label className="sm:col-span-2">
        <span className="store-label">Address line 1</span>
        <Input value={values.line1} onChange={(e) => setField("line1", e.target.value)} />
        {errors.line1 ? <p className="mt-1 text-xs text-red-600">{errors.line1}</p> : null}
      </label>
      <label className="sm:col-span-2">
        <span className="store-label">Address line 2</span>
        <Input value={values.line2 ?? ""} onChange={(e) => setField("line2", e.target.value)} />
      </label>
      <label>
        <span className="store-label">City</span>
        <Input value={values.city} onChange={(e) => setField("city", e.target.value)} />
      </label>
      <label>
        <span className="store-label">State</span>
        <Input value={values.state ?? ""} onChange={(e) => setField("state", e.target.value)} />
      </label>
      <label>
        <span className="store-label">Postal code</span>
        <Input value={values.postal_code ?? ""} onChange={(e) => setField("postal_code", e.target.value)} />
      </label>
      <label>
        <span className="store-label">Country</span>
        <Input value={values.country} onChange={(e) => setField("country", e.target.value.toUpperCase())} />
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save address"}
        </Button>
      </div>
    </form>
  );
}

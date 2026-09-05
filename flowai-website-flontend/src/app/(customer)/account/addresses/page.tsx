"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAddress, deleteAddress, listAddresses } from "@/api/addresses";
import AddressForm from "@/components/checkout/AddressForm";
import Button from "@/components/ui/button";
import { useUiStore } from "@/store/uiStore";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: listAddresses });

  const create = useMutation({
    mutationFn: createAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      pushToast("success", "Address saved");
    },
  });

  const remove = useMutation({
    mutationFn: deleteAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return (
    <main className="store-container py-10">
      <h1 className="text-3xl font-bold">Addresses</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {(addressesQuery.data ?? []).map((address) => (
            <div key={address.id} className="store-card p-4">
              <p className="font-medium">{address.full_name}</p>
              <p className="text-sm text-slate-500">
                {address.line1}, {address.city} {address.postal_code} {address.country}
              </p>
              <Button variant="ghost" className="mt-2 px-0 text-red-600" onClick={() => remove.mutate(address.id)}>
                Remove
              </Button>
            </div>
          ))}
          {!addressesQuery.data?.length ? <p className="text-sm text-slate-500">No saved addresses yet.</p> : null}
        </div>
        <div className="store-card p-5">
          <h2 className="mb-4 font-semibold">Add address</h2>
          <AddressForm submitting={create.isPending} onSubmit={async (values) => { await create.mutateAsync(values); }} />
        </div>
      </div>
    </main>
  );
}

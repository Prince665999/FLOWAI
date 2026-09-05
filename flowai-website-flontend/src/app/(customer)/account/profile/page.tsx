"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getProfile, updateProfile } from "@/api/profile";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useUiStore } from "@/store/uiStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setName(profileQuery.data.name);
    setPhone(profileQuery.data.phone ?? "");
    setCompany(profileQuery.data.company ?? "");
  }, [profileQuery.data]);

  const save = useMutation({
    mutationFn: () => updateProfile({ name, phone, company }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      pushToast("success", "Profile updated");
    },
    onError: (error) => pushToast("error", error instanceof Error ? error.message : "Update failed"),
  });

  return (
    <main className="store-container max-w-xl py-10">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-2 text-sm text-slate-500">Signed in as {user?.email}</p>
      <form
        className="store-card mt-8 space-y-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <label>
          <span className="store-label">Name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span className="store-label">Phone</span>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label>
          <span className="store-label">Company</span>
          <Input value={company} onChange={(event) => setCompany(event.target.value)} />
        </label>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </form>
    </main>
  );
}

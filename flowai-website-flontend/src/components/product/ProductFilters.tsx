"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import type { Category } from "@/types/category";

export default function ProductFilters({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? searchParams.get("q") ?? "");

  function update(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <form
      className="store-card mb-6 grid gap-3 p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        update({ search });
      }}
    >
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
      />
      <Select
        defaultValue={searchParams.get("category_id") ?? ""}
        onChange={(event) => update({ category_id: event.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(event) => update({ sort: event.target.value })}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name">Name</option>
      </Select>
      <Select
        defaultValue={searchParams.get("is_available") ?? ""}
        onChange={(event) => update({ is_available: event.target.value })}
      >
        <option value="">Any availability</option>
        <option value="true">In stock</option>
        <option value="false">Out of stock</option>
      </Select>
    </form>
  );
}

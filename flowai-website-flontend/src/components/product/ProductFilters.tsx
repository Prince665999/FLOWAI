"use client";
export default function ProductFilters({ onSearch }: { onSearch: (value:string)=>void }) { return <label className="block"><span className="sr-only">Search products</span><input className="w-full rounded-md border p-2" placeholder="Search products" onChange={(event)=>onSearch(event.target.value)}/></label>; }

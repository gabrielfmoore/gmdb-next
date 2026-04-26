"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "default";

  function submitSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inputQuery = String(formData.get("q") || "");
    const trimmed = inputQuery.trim();

    if (!trimmed) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("page");
    nextParams.set("q", trimmed);
    nextParams.set("sort", currentSort);

    router.push(`/search?${nextParams.toString()}`);
  }

  return (
    <form className="search-form" onSubmit={submitSearch}>
      <input
        type="text"
        name="q"
        className="search-input text-black placeholder:text-gray-500"
        placeholder="Search movies..."
        defaultValue={currentQuery}
      />
      <button type="submit" className="click text-black">
        Search
      </button>
    </form>
  );
}

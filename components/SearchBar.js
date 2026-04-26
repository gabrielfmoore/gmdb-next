"use client";

import { useRouter } from "next/navigation";

export function SearchBar({ intro = false }) {
  const router = useRouter();

  function submitSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inputQuery = String(formData.get("q") || "");
    const trimmed = inputQuery.trim();

    if (!trimmed) return;

    const currentParams = new URLSearchParams(window.location.search);
    const currentSort = currentParams.get("sort") || "default";
    const nextParams = new URLSearchParams(currentParams.toString());
    nextParams.delete("page");
    nextParams.set("q", trimmed);
    nextParams.set("sort", currentSort);

    router.push(`/search?${nextParams.toString()}`);
  }

  return (
    <form className={`search-form${intro ? " search-form--intro" : ""}`} onSubmit={submitSearch}>
      <input
        type="text"
        name="q"
        className="search-input text-black placeholder:text-gray-500"
        placeholder="Search movies..."
      />
      <button type="submit" className="click text-black">
        Search
      </button>
    </form>
  );
}

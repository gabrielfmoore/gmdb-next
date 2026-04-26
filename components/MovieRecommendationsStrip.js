"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { posterSrc } from "@/lib/movieDisplay";

export function MovieRecommendationsStrip({ recommendations }) {
  const [allLoaded, setAllLoaded] = useState(false);
  const recImageUrls = recommendations.map((rec) => posterSrc(rec.poster_path));

  useEffect(() => {
    let cancelled = false;
    setAllLoaded(false);
    const uniqueUrls = [...new Set(recImageUrls)];
    if (uniqueUrls.length === 0) {
      setAllLoaded(true);
      return () => {
        cancelled = true;
      };
    }
    const preloadTasks = uniqueUrls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
          if (img.complete) resolve(true);
        }),
    );
    Promise.allSettled(preloadTasks).then(() => {
      if (!cancelled) setAllLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [recommendations]);

  return (
    <section className="mb-10 mx-[5vw] lg:mx-0 w-full">
      <h2 className="text-xl font-bold mb-3 mx-[5vw] lg:mx-0  mt-4">More like this</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recommendations.map((rec) => {
          const recTitle = rec.title || "Untitled";
          const recSrc = posterSrc(rec.poster_path);
          return (
            <Link
              key={rec.id}
              href={`/movie/${rec.id}`}
              className="shrink-0 w-28 text-center text-xs text-gray-200 hover:text-white"
            >
              <div className="mb-1 w-full aspect-[2/3] bg-zinc-800 rounded-md overflow-hidden">
                <img
                  src={recSrc}
                  alt={recTitle}
                  className={`block w-full h-full rounded-md object-contain transition-opacity duration-200 ${
                    allLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <span className="line-clamp-2">{recTitle}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

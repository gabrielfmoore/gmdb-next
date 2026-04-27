"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { posterSrc } from "@/lib/movieDisplay";

export function MovieHeroPane({
  src,
  title,
  year,
  tagline,
  genres,
  runtimeLabel,
  imdbHref,
  omdbRatings,
  showOmdbHint,
  cast,
}) {
  const posterBoxRef = useRef(null);
  const [posterHeight, setPosterHeight] = useState(null);
  const [isSmUp, setIsSmUp] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const imageUrls = [src, ...cast.map((row) => posterSrc(row.profilePath))];

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsSmUp(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const posterElement = posterBoxRef.current;
    if (!posterElement) return;
    const measure = () => {
      const h = Math.round(posterElement.getBoundingClientRect().height);
      if (h > 0) setPosterHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(posterElement);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAllLoaded(false);
    const uniqueUrls = [...new Set(imageUrls)];
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
  }, [src, cast]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full items-center sm:items-start">
      <div className="w-[300px] sm:w-[40%] shrink-0">
        <div
          ref={posterBoxRef}
          className="relative bg-zinc-800 rounded-lg overflow-hidden aspect-[2/3]"
        >
          <img
            src={src}
            alt={title}
            className={`absolute inset-0 block w-full h-full rounded-lg object-contain transition-opacity duration-200 ${
              allLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={isSmUp && posterHeight ? { height: `${posterHeight}px` } : undefined}
      >
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">
          {title} ({year || "N/A"})
        </h1>
        {tagline ? (
          <p className="text-sm italic text-gray-400 text-center mb-2 mx-3">{tagline}</p>
        ) : null}
        {genres.length > 0 ? (
          <p className="text-sm text-gray-300 text-center mb-1">{genres.join(" · ")}</p>
        ) : null}
        <div className="flex flex-col text-center gap-1">
          {runtimeLabel ? <p className="text-sm text-gray-500">{runtimeLabel}</p> : null}
          <div className="flex justify-around sm:justify-between w-full text-[13px] text-gray-400">
            <div className="flex items-center gap-2">
              {imdbHref ? (
                <a className="imdb w-auto" href={imdbHref} target="_blank" rel="noreferrer">
                  <span className="imdb-logo">IMDb</span>
                </a>
              ) : (
                <span className="imdb-logo">IMDb</span>
              )}
              <span className="text-gray-200">{omdbRatings?.imdb ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Image
                src="/images/rotten-tomatoes.png"
                alt="Rotten Tomatoes"
                width={70}
                height={70}
              />
              <span className="text-gray-200">{omdbRatings?.rt ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1 mr-10 shrink-0">
              <Image
                src="/images/metacritic-logo.png"
                alt="Metacritic"
                width={24}
                height={24}
              />
              <span className="text-gray-200">{omdbRatings?.meta ?? "—"}</span>
            </div>
          </div>
          {showOmdbHint ? (
            <p className="text-xs text-gray-600">
              IMDb / RT / Metacritic scores use OMDb. Set{" "}
              <code className="text-gray-400">OMDB_API_KEY</code> in{" "}
              <code className="text-gray-400">.env.local</code>.
            </p>
          ) : null}
        </div>
        <div className="w-full flex flex-col ml-[5vw] sm:ml-0 sm:mr-[10vw] flex-1 min-h-0">
          {cast.length > 0 ? (
            <div className="mt-3 flex flex-col flex-1 min-h-0">
              <h2 className="text-lg sm:text-md md:text-lg font-bold text-gray-200">Top Cast</h2>
              <div className="mt-2 h-[220px] overflow-y-auto pr-1 min-h-0 sm:h-auto sm:max-h-none sm:flex-1 sm:mb-1">
                <ul className="sm:mr-[4vw] lg:mr-0 flex flex-wrap text-sm sm:text-xs md:text-sm text-gray-300">
                  {cast.map((row, index) => (
                    <li
                      key={`${row.name}-${index}`}
                      className="min-w-0 mb-3 pr-4 w-1/2 [@media(min-width:500px)]:w-1/3 lg:w-1/3"
                    >
                      {row.id ? (
                        <Link
                          href={`/person/${row.id}`}
                          className="flex flex-col justify-center items-center rounded-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                        >
                          <div className="w-[80px] bg-zinc-800 rounded-sm overflow-hidden mb-1">
                            <img
                              src={posterSrc(row.profilePath)}
                              alt={row.name || "Cast member"}
                              className={`block w-[80px] h-auto rounded-sm object-contain transition-opacity duration-200 ${
                                allLoaded ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </div>
                          <span className="block font-medium text-gray-200 text-center hover:text-white">
                            {row.name}
                          </span>
                          {row.character ? (
                            <span className="block text-gray-500 text-center">{row.character}</span>
                          ) : null}
                        </Link>
                      ) : (
                        <>
                          <div className="w-[80px] bg-zinc-800 rounded-sm overflow-hidden mb-1">
                            <img
                              src={posterSrc(row.profilePath)}
                              alt={row.name || "Cast member"}
                              className={`block w-[80px] h-auto rounded-sm object-contain transition-opacity duration-200 ${
                                allLoaded ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </div>
                          <span className="block font-medium text-gray-200">{row.name}</span>
                          {row.character ? (
                            <span className="block text-gray-500">{row.character}</span>
                          ) : null}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

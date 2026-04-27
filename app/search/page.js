"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NO_POSTER, posterSrc } from "@/lib/movieDisplay";

const MOVIES_PER_PAGE = 6;

function handlePosterError(event) {
  const imageElement = event.currentTarget;
  imageElement.onerror = null;
  imageElement.src = NO_POSTER;
}

/** Same movie can appear twice when stitching search pages; TMDB pagination can overlap in edge cases. */
function dedupeByTmdbId(movies) {
  const seenTmdbOrFallbackIds = new Set();
  return movies.filter((movie) => {
    const cardKey = movie.tmdbId ?? movie.imdbID;
    if (cardKey == null) return true;
    if (seenTmdbOrFallbackIds.has(cardKey)) return false;
    seenTmdbOrFallbackIds.add(cardKey);
    return true;
  });
}

function getSortValue(movie, sortType) {
  if (sortType === "tmdb" || sortType === "imdb") {
    return parseFloat(movie.imdbRating) || 0;
  }
  if (sortType === "rt") {
    const raw = typeof movie.rtRating === "string" ? movie.rtRating : "";
    const score = Number.parseInt(raw.replace("%", ""), 10);
    return Number.isFinite(score) ? score : -1;
  }
  if (sortType === "mc") {
    const raw = typeof movie.mcRating === "string" ? movie.mcRating : "";
    const score = Number.parseInt(raw.split("/")[0] || "", 10);
    return Number.isFinite(score) ? score : -1;
  }
  return 0;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const rawSort = searchParams.get("sort") || "default";
  const sortType = rawSort === "imdb" || rawSort === "tmdb" ? "tmdb" : rawSort;
  const requestedPage = Number(searchParams.get("page") || "1");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imdbByTmdbId, setImdbByTmdbId] = useState({});
  const [searchSettled, setSearchSettled] = useState(true);
  const [showPagination, setShowPagination] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadResults() {
      if (!query.trim()) {
        setResults([]);
        setError("");
        setSearchSettled(true);
        return;
      }

      setSearchSettled(false);
      setLoading(true);
      setError("");

      try {
        let stitchedSearchRows = [];
        for (let apiResultPage = 1; apiResultPage <= 5; apiResultPage += 1) {
          const searchResponse = await fetch(
            `/api/search?q=${encodeURIComponent(query)}&page=${apiResultPage}`,
          );
          const searchJson = await searchResponse.json();

          if (!searchResponse.ok) {
            throw new Error(searchJson.error || "Failed to search movies");
          }
          if (
            !Array.isArray(searchJson.Search) ||
            searchJson.Search.length === 0
          ) {
            break;
          }

          stitchedSearchRows = stitchedSearchRows.concat(searchJson.Search);
          if (stitchedSearchRows.length >= 50) {
            stitchedSearchRows = dedupeByTmdbId(stitchedSearchRows).slice(
              0,
              50,
            );
            break;
          }
        }

        if (!isCancelled) {
          setResults(
            dedupeByTmdbId(stitchedSearchRows).map((row) => ({
              ...row,
              rtRating: null,
              mcRating: null,
            })),
          );
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError.message || "Failed to load search results");
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setSearchSettled(true);
        }
      }
    }

    loadResults();
    return () => {
      isCancelled = true;
    };
  }, [query]);

  const sortedResults = useMemo(() => {
    const moviesInSortOrder = [...results];
    if (sortType !== "default") {
      moviesInSortOrder.sort(
        (first, second) =>
          getSortValue(second, sortType) - getSortValue(first, sortType),
      );
    }
    return moviesInSortOrder;
  }, [results, sortType]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedResults.length / MOVIES_PER_PAGE),
  );
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  useEffect(() => {
    if (requestedPage !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(currentPage));
      router.replace(`/search?${params.toString()}`);
    }
  }, [currentPage, requestedPage, router, searchParams]);

  const currentPageResults = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    return sortedResults.slice(start, start + MOVIES_PER_PAGE);
  }, [currentPage, sortedResults]);

  const shouldShowPagination =
    !loading && searchSettled && !error && query.trim() && sortedResults.length > 0;

  useEffect(() => {
    if (!shouldShowPagination) {
      setShowPagination(false);
      return;
    }
    const timer = setTimeout(() => setShowPagination(true), 180);
    return () => clearTimeout(timer);
  }, [shouldShowPagination]);

  useEffect(() => {
    let effectCancelled = false;

    async function hydrateImdbIds() {
      const sourceRows = sortType === "rt" || sortType === "mc" ? results : currentPageResults;
      const tmdbIdsNeedingDetails = sourceRows
        .map((movie) => movie.tmdbId)
        .filter((tmdbId) => tmdbId != null && imdbByTmdbId[tmdbId] === undefined);

      if (tmdbIdsNeedingDetails.length === 0) {
        return;
      }

      const uniqueTmdbIds = [...new Set(tmdbIdsNeedingDetails)];
      const detailByTmdbId = await Promise.all(
        uniqueTmdbIds.map(async (tmdbId) => {
          try {
            const movieDetailResponse = await fetch(
              `/api/movie?id=${encodeURIComponent(String(tmdbId))}`,
            );
            if (!movieDetailResponse.ok) {
              return { tmdbId, imdbTitleId: null, rtRating: null, mcRating: null };
            }
            const movieDetailJson = await movieDetailResponse.json();
            const imdbTitleId =
              typeof movieDetailJson?.imdbID === "string" &&
              movieDetailJson.imdbID.startsWith("tt")
                ? movieDetailJson.imdbID
                : null;
            return {
              tmdbId,
              imdbTitleId,
              rtRating: movieDetailJson?.rtRating ?? null,
              mcRating: movieDetailJson?.mcRating ?? null,
            };
          } catch {
            return { tmdbId, imdbTitleId: null, rtRating: null, mcRating: null };
          }
        }),
      );

      if (effectCancelled) {
        return;
      }

      setImdbByTmdbId((previousByTmdbId) => {
        const merged = { ...previousByTmdbId };
        for (const { tmdbId, imdbTitleId } of detailByTmdbId) {
          merged[tmdbId] = imdbTitleId;
        }
        return merged;
      });

      setResults((previousResults) =>
        previousResults.map((movie) => {
          const tmdbId = movie.tmdbId;
          const details = detailByTmdbId.find((row) => row.tmdbId === tmdbId);
          if (!details) return movie;
          return {
            ...movie,
            rtRating: details.rtRating,
            mcRating: details.mcRating,
          };
        }),
      );
    }

    hydrateImdbIds();
    return () => {
      effectCancelled = true;
    };
  }, [currentPageResults, imdbByTmdbId, results, sortType]);

  function setPage(nextPage) {
    const page = Math.min(Math.max(nextPage, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/search?${params.toString()}`);
  }

  function setSort(nextSort) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  function movieLink(movie) {
    const imdbId =
      (movie.tmdbId != null && imdbByTmdbId[movie.tmdbId]) ||
      (typeof movie.imdbID === "string" && movie.imdbID.startsWith("tt")
        ? movie.imdbID
        : null);

    if (imdbId) return `https://www.imdb.com/title/${imdbId}/`;
    if (movie.tmdbId != null)
      return `https://www.themoviedb.org/movie/${movie.tmdbId}`;
    return "https://www.themoviedb.org/";
  }

  return (
    <main>
      <div className="sort-dropdown__wrapper">
        <select
          className="sort-dropdown"
          value={sortType}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort search results"
          style={{ display: "block" }}
        >
          <option value="default">Sort by...</option>
          <option value="tmdb">TMDB score (High to Low)</option>
          <option value="rt">Rotten Tomatoes (High to Low)</option>
          <option value="mc">Metacritic (High to Low)</option>
        </select>
      </div>

      <div className="gmdb-container">
        {!query && (
          <div className="welcome-message">
            Search for your
            <br /> favorite movies!
          </div>
        )}

        {loading && (
          <div
            className="spinner-container loading"
            style={{ display: "block" }}
          >
            <i className="fa-solid fa-spinner loading__spinner" />
          </div>
        )}

        <div className="row search-row">
          <div className="search-results">
            {!loading && error && <div className="no-results">{error}</div>}
            {!loading &&
              !error &&
              currentPageResults.map((movie) => (
                <Link
                  className="movie fade-in"
                  href={`/movie/${movie.tmdbId}`}
                  key={movie.tmdbId ?? movie.imdbID}
                >
                  <img
                    className="movie-poster"
                    src={posterSrc(movie.Poster)}
                    alt={movie.Title}
                    onError={handlePosterError}
                  />
                  <div className="movie-details">
                    <div className="movie-title">
                      <b>{movie.Title}</b>
                    </div>
                    <div className="year">{movie.Year || "N/A"}</div>
                    <button
                      type="button"
                      className="imdb"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        window.open(
                          movieLink(movie),
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                    >
                      <span className="imdb-logo">IMDb</span>
                    </button>
                  </div>
                </Link>
              ))}
            {!loading && searchSettled && !error && query && currentPageResults.length === 0 && (
              <div className="no-results">No results found. 😢</div>
            )}
          </div>
        </div>

        <div
          className={`pagination text-black${showPagination ? " pagination--fade-in" : ""}`}
          style={{
            display: showPagination ? "flex" : "none",
          }}
        >
          <button
            type="button"
            className="page-btn prev-page"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ←
          </button>
          <select
            className="page-num"
            value={currentPage}
            onChange={(event) => setPage(Number(event.target.value))}
          >
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <option key={pageNumber} value={pageNumber}>
                  {pageNumber}
                </option>
              ),
            )}
          </select>
          <button
            type="button"
            className="page-btn next-page"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main>
          <div className="gmdb-container" />
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

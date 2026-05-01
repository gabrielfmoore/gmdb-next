const TMDB_API_V3_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

function assertEnv() {
  if (!READ_ACCESS_TOKEN && !API_KEY) {
    throw new Error(
      "Set TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY in .env.local (then restart `next dev`)",
    );
  }
}

/**
 * @param {string} path - e.g. "/search/movie"
 * @param {Record<string, string | number | undefined | null>} queryParams
 */
export async function tmdbFetch(path, queryParams = {}) {
  assertEnv();
  const requestUrl = new URL(`${TMDB_API_V3_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [paramName, paramValue] of Object.entries(queryParams)) {
    if (paramValue !== undefined && paramValue !== null && paramValue !== "") {
      requestUrl.searchParams.set(paramName, String(paramValue));
    }
  }

  const requestHeaders = {};
  if (READ_ACCESS_TOKEN) {
    requestHeaders.Authorization = `Bearer ${READ_ACCESS_TOKEN}`;
  } else {
    requestUrl.searchParams.set("api_key", API_KEY);
  }

  const response = await fetch(requestUrl.toString(), { cache: "no-store", headers: requestHeaders });
  const responseJson = await response.json();
  if (!response.ok) {
    const detail = responseJson?.status_message || responseJson?.errors;
    const message = [response.status, detail].filter(Boolean).join(" — ");
    throw new Error(`TMDB request failed${message ? `: ${message}` : ""}`);
  }
  return responseJson;
}

/**
 * @param {string} searchQuery
 * @param {number} page
 */
export async function searchMovies(searchQuery, page = 1) {
  if (!String(searchQuery).trim()) {
    return { results: [], total_results: 0, total_pages: 0, page: 1 };
  }
  return tmdbFetch("/search/movie", { query: searchQuery.trim(), page: String(page) });
}

/**
 * @param {number} page
 */
export async function getPopularMovies(page = 1) {
  return tmdbFetch("/movie/popular", { page: String(page) });
}

/**
 * @param {string | number} tmdbId
 */
export async function getMovieByTmdbId(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: "external_ids,credits,recommendations",
  });
}

/**
 * Streaming / rent / buy availability by country (JustWatch via TMDB).
 * @param {string | number} tmdbId
 */
export async function getMovieWatchProviders(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/watch/providers`);
}

/**
 * @param {string | number} tmdbPersonId
 */
export async function getPersonByTmdbId(tmdbPersonId) {
  return tmdbFetch(`/person/${tmdbPersonId}`, {
    append_to_response: "combined_credits,external_ids",
  });
}

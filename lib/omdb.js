/**
 * Optional OMDb lookup for IMDb / Rotten Tomatoes / Metacritic display values.
 * Set `OMDB_API_KEY` in `.env.local` (OMDb requires this for `plot=short` etc.).
 */

/**
 * @param {string} imdbId e.g. `tt0111161`
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function fetchOmdbByImdbId(imdbId) {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey || typeof imdbId !== "string" || !imdbId.startsWith("tt")) {
    return null;
  }
  try {
    const requestUrl = new URL("https://www.omdbapi.com/");
    requestUrl.searchParams.set("i", imdbId);
    requestUrl.searchParams.set("apikey", apiKey);
    const response = await fetch(requestUrl.toString(), { next: { revalidate: 86_400 } });
    const json = await response.json();
    if (!response.ok || json.Response === "False") {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, unknown> | null} omdb
 * @returns {{ imdb: string | null; rt: string | null; meta: string | null } | null}
 */
export function parseOmdbRatings(omdb) {
  if (omdb == null || omdb.Response === "False") {
    return null;
  }
  let imdb = null;
  let rt = null;
  let meta = null;

  const topImdb = omdb.imdbRating;
  if (typeof topImdb === "string" && topImdb !== "N/A") {
    imdb = `${topImdb}/10`;
  }
  const topMeta = omdb.Metascore;
  if (typeof topMeta === "string" && topMeta !== "N/A") {
    meta = `${topMeta}/100`;
  }

  const ratings = Array.isArray(omdb.Ratings) ? omdb.Ratings : [];
  for (const entry of ratings) {
    const source = typeof entry?.Source === "string" ? entry.Source : "";
    const value = typeof entry?.Value === "string" ? entry.Value : "";
    if (!value || value === "N/A") continue;
    if (source.includes("Rotten Tomatoes")) {
      rt = value;
    }
    if (source.includes("Metacritic")) {
      meta = value;
    }
    if (source.includes("Internet Movie Database")) {
      imdb = value;
    }
  }

  if (imdb == null && rt == null && meta == null) {
    return null;
  }
  return { imdb, rt, meta };
}
